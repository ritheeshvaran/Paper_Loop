"""Paper & Loop – Backend API (FastAPI + MongoDB)."""
from __future__ import annotations

import os
import re
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Literal

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from starlette.middleware.cors import CORSMiddleware


# ─── Setup ──────────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ.get("JWT_SECRET", "paper-loop-dev-secret-change-me")
JWT_ALG = "HS256"
JWT_TTL_HOURS = 24 * 14  # 14 days

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Paper & Loop API")
api = APIRouter(prefix="/api")
bearer = HTTPBearer(auto_error=False)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("paperloop")


# ─── Helpers ────────────────────────────────────────────────────────────────
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def slugify(text: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return s or new_id()[:8]


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_pw(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def make_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_TTL_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])


def strip_id(doc: dict | None) -> dict | None:
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


async def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    if not cred:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = decode_token(cred.credentials)
    except jwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("is_blocked"):
        raise HTTPException(401, "User not found or blocked")
    return user


async def get_optional_user(cred: HTTPAuthorizationCredentials = Depends(bearer)) -> Optional[dict]:
    if not cred:
        return None
    try:
        payload = decode_token(cred.credentials)
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        return user
    except Exception:
        return None


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user


# ─── Models ─────────────────────────────────────────────────────────────────
class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    phone: str = ""
    address_line1: str = ""
    address_line2: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None


class CategoryInput(BaseModel):
    name: str
    slug: Optional[str] = None
    banner_image_url: Optional[str] = None
    sort_order: int = 0


class ProductInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    slug: Optional[str] = None
    category_slug: str
    description: str = ""
    price: float
    discount_percent: float = 0
    stock_quantity: int = 10
    images: List[str] = []
    lifestyle_image: Optional[str] = None
    material: str = "Premium 250gsm matte paper"
    size: str = "A3 (11.7 x 16.5 in)"
    finish: str = "Matte"
    is_featured: bool = False
    is_trending: bool = False
    is_best_seller: bool = False
    is_new: bool = True
    is_limited: bool = False
    visibility: Literal["draft", "published"] = "published"


class CartItemInput(BaseModel):
    product_id: str
    quantity: int = 1


class CheckoutInput(BaseModel):
    order_note: str = ""
    address_line1: str
    address_line2: str = ""
    city: str
    state: str
    pincode: str
    phone: str


class SubmitPaymentInput(BaseModel):
    transaction_id: str


class UpdateOrderStatusInput(BaseModel):
    status: str
    note: Optional[str] = None


class SetDeliveryDateInput(BaseModel):
    delivery_date: str  # ISO


class SettingsUpdate(BaseModel):
    logo_url: Optional[str] = None
    hero_images: Optional[List[str]] = None
    gpay_qr_url: Optional[str] = None
    upi_id: Optional[str] = None
    announcement: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None


ORDER_FLOW = [
    "placed",
    "payment_under_validation",
    "approved",
    "preparing",
    "packed",
    "out_for_delivery",
    "delivered",
]


# ─── Auth Routes ────────────────────────────────────────────────────────────
@api.post("/auth/register")
async def register(inp: RegisterInput):
    existing = await db.users.find_one({"email": inp.email.lower()})
    if existing:
        raise HTTPException(400, "Email already registered")
    user = {
        "id": new_id(),
        "email": inp.email.lower(),
        "password_hash": hash_pw(inp.password),
        "name": inp.name,
        "phone": inp.phone,
        "address_line1": inp.address_line1,
        "address_line2": inp.address_line2,
        "city": inp.city,
        "state": inp.state,
        "pincode": inp.pincode,
        "role": "customer",
        "is_blocked": False,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    token = make_token(user["id"], user["role"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user}


@api.post("/auth/login")
async def login(inp: LoginInput):
    user = await db.users.find_one({"email": inp.email.lower()})
    if not user:
        raise HTTPException(404, "No account found with that email")
    if not verify_pw(inp.password, user["password_hash"]):
        raise HTTPException(401, "Password doesn't match")
    if user.get("is_blocked"):
        raise HTTPException(403, "Account blocked")
    token = make_token(user["id"], user["role"])
    user.pop("password_hash", None)
    user.pop("_id", None)
    return {"token": token, "user": user}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


@api.put("/auth/me")
async def update_me(inp: ProfileUpdate, user: dict = Depends(get_current_user)):
    patch = {k: v for k, v in inp.model_dump().items() if v is not None}
    if patch:
        await db.users.update_one({"id": user["id"]}, {"$set": patch})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return fresh


# ─── Categories ─────────────────────────────────────────────────────────────
@api.get("/categories")
async def list_categories():
    cats = await db.categories.find({}, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return cats


@api.post("/admin/categories")
async def create_category(inp: CategoryInput, _: dict = Depends(require_admin)):
    slug = inp.slug or slugify(inp.name)
    if await db.categories.find_one({"slug": slug}):
        raise HTTPException(400, "Slug already exists")
    doc = {"id": new_id(), "slug": slug, "name": inp.name,
           "banner_image_url": inp.banner_image_url, "sort_order": inp.sort_order,
           "created_at": now_iso()}
    await db.categories.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/admin/categories/{cat_id}")
async def update_category(cat_id: str, inp: CategoryInput, _: dict = Depends(require_admin)):
    patch = inp.model_dump(exclude_unset=True)
    await db.categories.update_one({"id": cat_id}, {"$set": patch})
    return strip_id(await db.categories.find_one({"id": cat_id}))


@api.delete("/admin/categories/{cat_id}")
async def delete_category(cat_id: str, _: dict = Depends(require_admin)):
    cnt = await db.products.count_documents({"category_id": cat_id})
    if cnt > 0:
        raise HTTPException(400, "Reassign products before deleting")
    await db.categories.delete_one({"id": cat_id})
    return {"ok": True}


# ─── Products ───────────────────────────────────────────────────────────────
def _compute_price(p: dict) -> dict:
    disc = float(p.get("discount_percent") or 0)
    price = float(p["price"])
    final = round(price * (1 - disc / 100), 2) if disc else price
    p["final_price"] = final
    p["has_discount"] = disc > 0
    return p


@api.get("/products")
async def list_products(
    category: Optional[str] = None,
    q: Optional[str] = None,
    sort: str = "newest",
    featured: Optional[bool] = None,
    trending: Optional[bool] = None,
    best_seller: Optional[bool] = None,
    limit: int = 60,
):
    query: dict = {"visibility": "published"}
    if category:
        query["category_slug"] = category
    if featured:
        query["is_featured"] = True
    if trending:
        query["is_trending"] = True
    if best_seller:
        query["is_best_seller"] = True
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"category_slug": {"$regex": q, "$options": "i"}},
        ]
    sort_key = {"newest": [("created_at", -1)], "price_asc": [("price", 1)],
                "price_desc": [("price", -1)], "popularity": [("is_best_seller", -1), ("created_at", -1)]}.get(sort, [("created_at", -1)])
    cur = db.products.find(query, {"_id": 0}).sort(sort_key).limit(limit)
    items = [_compute_price(p) async for p in cur]
    return items


@api.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return _compute_price(p)


@api.get("/admin/products")
async def admin_list_products(_: dict = Depends(require_admin)):
    items = await db.products.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_compute_price(p) for p in items]


@api.post("/admin/products")
async def create_product(inp: ProductInput, _: dict = Depends(require_admin)):
    slug = inp.slug or slugify(inp.name)
    if await db.products.find_one({"slug": slug}):
        slug = f"{slug}-{new_id()[:4]}"
    doc = inp.model_dump()
    doc.update({
        "id": new_id(),
        "slug": slug,
        "created_at": now_iso(),
        "updated_at": now_iso(),
    })
    await db.products.insert_one(doc)
    return _compute_price(strip_id(doc))


@api.put("/admin/products/{pid}")
async def update_product(pid: str, inp: ProductInput, _: dict = Depends(require_admin)):
    patch = inp.model_dump(exclude_unset=True)
    patch["updated_at"] = now_iso()
    await db.products.update_one({"id": pid}, {"$set": patch})
    return _compute_price(strip_id(await db.products.find_one({"id": pid})))


@api.delete("/admin/products/{pid}")
async def delete_product(pid: str, _: dict = Depends(require_admin)):
    await db.products.delete_one({"id": pid})
    return {"ok": True}


# ─── Cart ───────────────────────────────────────────────────────────────────
async def _fetch_cart(user_id: str) -> dict:
    items = await db.carts.find({"user_id": user_id}, {"_id": 0}).to_list(200)
    subtotal = 0.0
    discount_total = 0.0
    detailed: list = []
    for it in items:
        p = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if not p:
            continue
        p = _compute_price(p)
        line_total = p["final_price"] * it["quantity"]
        subtotal += p["price"] * it["quantity"]
        discount_total += (p["price"] - p["final_price"]) * it["quantity"]
        detailed.append({
            "product_id": p["id"],
            "quantity": it["quantity"],
            "product": p,
            "line_total": round(line_total, 2),
        })
    return {
        "items": detailed,
        "subtotal": round(subtotal, 2),
        "discount_total": round(discount_total, 2),
        "delivery": 0.0,
        "total": round(subtotal - discount_total, 2),
    }


@api.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    return await _fetch_cart(user["id"])


@api.post("/cart")
async def add_to_cart(inp: CartItemInput, user: dict = Depends(get_current_user)):
    existing = await db.carts.find_one({"user_id": user["id"], "product_id": inp.product_id})
    if existing:
        await db.carts.update_one({"_id": existing["_id"]},
                                  {"$inc": {"quantity": inp.quantity},
                                   "$set": {"updated_at": now_iso()}})
    else:
        await db.carts.insert_one({
            "id": new_id(), "user_id": user["id"],
            "product_id": inp.product_id, "quantity": inp.quantity,
            "updated_at": now_iso(),
        })
    return await _fetch_cart(user["id"])


@api.put("/cart/{product_id}")
async def update_cart(product_id: str, inp: CartItemInput, user: dict = Depends(get_current_user)):
    if inp.quantity <= 0:
        await db.carts.delete_one({"user_id": user["id"], "product_id": product_id})
    else:
        await db.carts.update_one(
            {"user_id": user["id"], "product_id": product_id},
            {"$set": {"quantity": inp.quantity, "updated_at": now_iso()}},
        )
    return await _fetch_cart(user["id"])


@api.delete("/cart/{product_id}")
async def remove_from_cart(product_id: str, user: dict = Depends(get_current_user)):
    await db.carts.delete_one({"user_id": user["id"], "product_id": product_id})
    return await _fetch_cart(user["id"])


# ─── Wishlist ───────────────────────────────────────────────────────────────
@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    items = await db.wishlists.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    products = []
    for it in items:
        p = await db.products.find_one({"id": it["product_id"]}, {"_id": 0})
        if p:
            products.append(_compute_price(p))
    return products


@api.post("/wishlist/{product_id}")
async def toggle_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    existing = await db.wishlists.find_one({"user_id": user["id"], "product_id": product_id})
    if existing:
        await db.wishlists.delete_one({"_id": existing["_id"]})
        return {"wishlisted": False}
    await db.wishlists.insert_one({
        "id": new_id(), "user_id": user["id"],
        "product_id": product_id, "created_at": now_iso(),
    })
    return {"wishlisted": True}


# ─── Orders ─────────────────────────────────────────────────────────────────
async def _next_order_number() -> str:
    year = datetime.now(timezone.utc).year
    count = await db.orders.count_documents({}) + 1
    return f"PL-{year}-{count:05d}"


@api.post("/orders/checkout")
async def checkout(inp: CheckoutInput, user: dict = Depends(get_current_user)):
    cart = await _fetch_cart(user["id"])
    if not cart["items"]:
        raise HTTPException(400, "Cart is empty")
    order_id = new_id()
    order = {
        "id": order_id,
        "order_number": await _next_order_number(),
        "user_id": user["id"],
        "customer_name": user["name"],
        "customer_email": user["email"],
        "phone": inp.phone,
        "address_line1": inp.address_line1,
        "address_line2": inp.address_line2,
        "city": inp.city,
        "state": inp.state,
        "pincode": inp.pincode,
        "items": [{
            "product_id": it["product_id"],
            "product_name": it["product"]["name"],
            "product_image": (it["product"].get("images") or [None])[0],
            "product_slug": it["product"]["slug"],
            "unit_price": it["product"]["price"],
            "final_price": it["product"]["final_price"],
            "quantity": it["quantity"],
            "line_total": it["line_total"],
        } for it in cart["items"]],
        "subtotal": cart["subtotal"],
        "discount_total": cart["discount_total"],
        "delivery": 0.0,
        "total": cart["total"],
        "status": "placed",
        "payment_status": "pending",
        "transaction_id": None,
        "delivery_date": None,
        "order_note": inp.order_note,
        "timeline": [{"status": "placed", "at": now_iso(), "note": "Order placed"}],
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.orders.insert_one(order)
    # Reserve inventory (soft): decrement stock
    for it in cart["items"]:
        await db.products.update_one(
            {"id": it["product_id"]},
            {"$inc": {"stock_quantity": -it["quantity"]}},
        )
    # Clear cart
    await db.carts.delete_many({"user_id": user["id"]})
    return strip_id(order)


@api.post("/orders/{order_id}/submit-payment")
async def submit_payment(order_id: str, inp: SubmitPaymentInput, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]})
    if not order:
        raise HTTPException(404, "Order not found")
    if order["status"] not in ("placed", "payment_under_validation"):
        raise HTTPException(400, "Order not accepting payment update")
    await db.orders.update_one({"id": order_id}, {
        "$set": {
            "transaction_id": inp.transaction_id,
            "status": "payment_under_validation",
            "payment_status": "under_validation",
            "updated_at": now_iso(),
        },
        "$push": {"timeline": {
            "status": "payment_under_validation",
            "at": now_iso(),
            "note": f"Transaction {inp.transaction_id} submitted",
        }},
    })
    return strip_id(await db.orders.find_one({"id": order_id}))


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return orders


@api.get("/orders/{order_id}")
async def get_order(order_id: str, user: dict = Depends(get_current_user)):
    q = {"id": order_id}
    if user.get("role") != "admin":
        q["user_id"] = user["id"]
    order = await db.orders.find_one(q, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@api.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["id"]})
    if not order:
        raise HTTPException(404, "Order not found")
    if order["status"] not in ("placed", "payment_under_validation", "approved"):
        raise HTTPException(400, "Order cannot be cancelled at this stage")
    await db.orders.update_one({"id": order_id}, {
        "$set": {"status": "cancelled", "updated_at": now_iso(),
                 "cancelled_at": now_iso()},
        "$push": {"timeline": {"status": "cancelled", "at": now_iso(),
                                "note": "Cancelled by customer"}},
    })
    # Restore stock
    for it in order["items"]:
        await db.products.update_one(
            {"id": it["product_id"]},
            {"$inc": {"stock_quantity": it["quantity"]}},
        )
    return strip_id(await db.orders.find_one({"id": order_id}))


# ─── Admin: Orders ──────────────────────────────────────────────────────────
@api.get("/admin/orders")
async def admin_list_orders(_: dict = Depends(require_admin),
                            status: Optional[str] = None,
                            q: Optional[str] = None):
    query: dict = {}
    if status:
        query["status"] = status
    if q:
        query["$or"] = [
            {"order_number": {"$regex": q, "$options": "i"}},
            {"customer_email": {"$regex": q, "$options": "i"}},
            {"customer_name": {"$regex": q, "$options": "i"}},
            {"transaction_id": {"$regex": q, "$options": "i"}},
        ]
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


@api.put("/admin/orders/{order_id}/status")
async def admin_update_status(order_id: str, inp: UpdateOrderStatusInput,
                              admin: dict = Depends(require_admin)):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(404, "Order not found")
    new_status = inp.status
    if new_status == "cancelled":
        # Restore stock if going from non-cancelled to cancelled
        if order["status"] != "cancelled":
            for it in order["items"]:
                await db.products.update_one(
                    {"id": it["product_id"]},
                    {"$inc": {"stock_quantity": it["quantity"]}},
                )
    else:
        # Ensure forward-only for the standard flow
        if order["status"] in ORDER_FLOW and new_status in ORDER_FLOW:
            if ORDER_FLOW.index(new_status) < ORDER_FLOW.index(order["status"]):
                raise HTTPException(400, "Cannot move order backward")
    payment_status = order.get("payment_status", "pending")
    if new_status == "approved":
        payment_status = "verified"
    await db.orders.update_one({"id": order_id}, {
        "$set": {"status": new_status, "payment_status": payment_status,
                 "updated_at": now_iso()},
        "$push": {"timeline": {"status": new_status, "at": now_iso(),
                                "note": inp.note or "", "by": admin["email"]}},
    })
    await db.activity_log.insert_one({
        "id": new_id(), "admin_id": admin["id"], "action_type": "order_status_change",
        "entity_type": "order", "entity_id": order_id,
        "before_value": order["status"], "after_value": new_status,
        "created_at": now_iso(),
    })
    return strip_id(await db.orders.find_one({"id": order_id}))


@api.put("/admin/orders/{order_id}/delivery-date")
async def admin_set_delivery(order_id: str, inp: SetDeliveryDateInput,
                             _: dict = Depends(require_admin)):
    await db.orders.update_one({"id": order_id},
                               {"$set": {"delivery_date": inp.delivery_date,
                                         "updated_at": now_iso()}})
    return strip_id(await db.orders.find_one({"id": order_id}))


# ─── Admin: Customers ───────────────────────────────────────────────────────
@api.get("/admin/customers")
async def admin_list_customers(_: dict = Depends(require_admin)):
    users = await db.users.find({"role": "customer"},
                                {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)
    for u in users:
        orders = await db.orders.find({"user_id": u["id"]}, {"_id": 0}).to_list(500)
        u["order_count"] = len(orders)
        u["total_spent"] = round(sum(o.get("total", 0) for o in orders if o.get("status") != "cancelled"), 2)
    return users


# ─── Settings ───────────────────────────────────────────────────────────────
async def _get_settings() -> dict:
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    if not s:
        s = {"key": "site", **_default_settings()}
        await db.settings.insert_one(s)
        s.pop("_id", None)
    return s


def _default_settings() -> dict:
    return {
        "logo_url": "https://customer-assets-eiarnc6j.emergentagent.net/job_d140b9e1-cf47-4cc2-ae45-11f2538d2dd6/artifacts/ng4o1n3u_image.png",
        "hero_images": [
            "https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=2000",
            "https://images.unsplash.com/photo-1523585298601-d46ae038d7d3?w=2000",
            "https://images.pexels.com/photos/33050959/pexels-photo-33050959.jpeg?auto=compress&cs=tinysrgb&w=2000",
        ],
        "gpay_qr_url": "https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=upi://pay?pa=paperandloop@upi&pn=Paper%20%26%20Loop&cu=INR",
        "upi_id": "paperandloop@upi",
        "announcement": "New Drop — Tokyo Nights collection. Limited then gone.",
        "instagram_url": "https://instagram.com/paperandloop",
        "whatsapp_url": "https://wa.me/919999999999",
        "contact_email": "hello@paperandloop.com",
        "contact_phone": "+91 99999 99999",
        "address": "Chennai, India",
    }


@api.get("/settings")
async def get_settings():
    return await _get_settings()


@api.put("/admin/settings")
async def update_settings(inp: SettingsUpdate, admin: dict = Depends(require_admin)):
    patch = {k: v for k, v in inp.model_dump().items() if v is not None}
    if patch:
        await db.settings.update_one({"key": "site"}, {"$set": patch}, upsert=True)
    return await _get_settings()


# ─── Admin: Analytics ───────────────────────────────────────────────────────
@api.get("/admin/analytics")
async def admin_analytics(_: dict = Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).to_list(2000)
    total_revenue = sum(o.get("total", 0) for o in orders if o.get("status") == "delivered")
    all_revenue = sum(o.get("total", 0) for o in orders if o.get("status") != "cancelled")
    pending = sum(1 for o in orders if o.get("status") in ("placed", "payment_under_validation"))
    approved = sum(1 for o in orders if o.get("status") in ("approved", "preparing", "packed", "out_for_delivery"))
    delivered = sum(1 for o in orders if o.get("status") == "delivered")
    cancelled = sum(1 for o in orders if o.get("status") == "cancelled")
    product_count = await db.products.count_documents({})
    customer_count = await db.users.count_documents({"role": "customer"})
    # top products
    counts: dict = {}
    for o in orders:
        for it in o.get("items", []):
            counts[it["product_id"]] = counts.get(it["product_id"], 0) + it["quantity"]
    top = sorted(counts.items(), key=lambda x: -x[1])[:5]
    top_products = []
    for pid, qty in top:
        p = await db.products.find_one({"id": pid}, {"_id": 0, "name": 1, "images": 1, "id": 1, "price": 1})
        if p:
            top_products.append({**p, "sold": qty})
    return {
        "total_revenue": round(all_revenue, 2),
        "delivered_revenue": round(total_revenue, 2),
        "order_counts": {"pending": pending, "approved": approved, "delivered": delivered, "cancelled": cancelled, "total": len(orders)},
        "product_count": product_count,
        "customer_count": customer_count,
        "top_products": top_products,
    }


# ─── Seed ───────────────────────────────────────────────────────────────────
async def seed_if_empty():
    # Admin user
    admin_email = "ritheeshvaran2007@gmail.com"
    if not await db.users.find_one({"email": admin_email}):
        await db.users.insert_one({
            "id": new_id(),
            "email": admin_email,
            "password_hash": hash_pw("admin123"),
            "name": "Paper & Loop Admin",
            "phone": "",
            "role": "admin",
            "is_blocked": False,
            "address_line1": "", "address_line2": "",
            "city": "", "state": "", "pincode": "",
            "created_at": now_iso(),
        })
        log.info("Seeded admin: %s", admin_email)

    # Demo customer
    demo_email = "demo@paperandloop.com"
    if not await db.users.find_one({"email": demo_email}):
        await db.users.insert_one({
            "id": new_id(),
            "email": demo_email,
            "password_hash": hash_pw("demo1234"),
            "name": "Demo Customer",
            "phone": "9999999999",
            "role": "customer",
            "is_blocked": False,
            "address_line1": "12, MG Road", "address_line2": "Flat 3B",
            "city": "Chennai", "state": "Tamil Nadu", "pincode": "600001",
            "created_at": now_iso(),
        })

    # Settings
    await _get_settings()

    # Categories
    categories_seed = [
        ("Anime", "anime", "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600"),
        ("Cars", "cars", "https://images.unsplash.com/photo-1604705528621-81b2755a320b?w=1600"),
        ("Sports", "sports", "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1600"),
        ("Movies", "movies", "https://images.unsplash.com/photo-1489599162718-9b8b0e30dcc6?w=1600"),
        ("Music", "music", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600"),
        ("Gaming", "gaming", "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600"),
        ("Motivational", "motivational", "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1600"),
        ("Keychains", "keychains", "https://images.unsplash.com/photo-1607081692251-b8b7fdd4f6ff?w=1600"),
    ]
    for i, (name, slug, banner) in enumerate(categories_seed):
        if not await db.categories.find_one({"slug": slug}):
            await db.categories.insert_one({
                "id": new_id(), "name": name, "slug": slug,
                "banner_image_url": banner, "sort_order": i,
                "created_at": now_iso(),
            })

    # Products
    if await db.products.count_documents({}) > 0:
        return
    products_seed = [
        # Anime
        {"name": "Tokyo Nights", "category_slug": "anime", "price": 799, "discount_percent": 15,
         "description": "Neon-soaked skyline framed in editorial ink. Panels off the page, onto your wall.",
         "images": ["https://images.unsplash.com/photo-1554797589-7241bb691973?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=1200",
         "is_featured": True, "is_best_seller": True, "is_new": True},
        {"name": "Sakura Riot", "category_slug": "anime", "price": 699,
         "description": "Cherry blossoms in a color palette that refuses to whisper.",
         "images": ["https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200",
         "is_trending": True, "is_new": True},
        # Cars
        {"name": "Midnight GT-R", "category_slug": "cars", "price": 899, "discount_percent": 10,
         "description": "JDM icon shot in low-key lighting. Torque, framed.",
         "images": ["https://images.unsplash.com/photo-1600661653561-629509216228?w=1200"],
         "lifestyle_image": "https://images.pexels.com/photos/16335705/pexels-photo-16335705.jpeg",
         "is_featured": True, "is_best_seller": True},
        {"name": "Autobahn Ghost", "category_slug": "cars", "price": 849,
         "description": "Long exposure, longer story. A car that only exists at 3AM.",
         "images": ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"],
         "lifestyle_image": "https://images.pexels.com/photos/5322558/pexels-photo-5322558.jpeg",
         "is_trending": True},
        # Sports
        {"name": "Court Kings", "category_slug": "sports", "price": 749,
         "description": "Hardwood culture in monochrome. For the ones who stayed late.",
         "images": ["https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=1200",
         "is_new": True},
        {"name": "Grid Position", "category_slug": "sports", "price": 799, "discount_percent": 20,
         "description": "F1-inspired minimalism. Pole position energy on paper.",
         "images": ["https://images.unsplash.com/photo-1541773367336-d3f5ed7cb37e?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1541773367336-d3f5ed7cb37e?w=1200",
         "is_limited": True},
        # Movies
        {"name": "Reel Static", "category_slug": "movies", "price": 699,
         "description": "A love letter to celluloid grain and neon marquees.",
         "images": ["https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1489599162718-9b8b0e30dcc6?w=1200",
         "is_featured": True},
        # Music
        {"name": "808 Cathedral", "category_slug": "music", "price": 749,
         "description": "Bass, cathedral ceilings, and one perfect kick drum.",
         "images": ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200",
         "is_trending": True, "is_new": True},
        # Gaming
        {"name": "Frame Rate", "category_slug": "gaming", "price": 799, "discount_percent": 10,
         "description": "Ultrawide dreams and RGB nightmares. Made for the setup.",
         "images": ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200",
         "is_best_seller": True},
        # Motivational
        {"name": "No Days Off", "category_slug": "motivational", "price": 599,
         "description": "Ink on paper. Cliché-free version of the phrase you're already living.",
         "images": ["https://images.unsplash.com/photo-1519834785169-98be25ec3f84?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=1200",
         "is_new": True},
        # Keychains
        {"name": "JDM Kanji Keychain", "category_slug": "keychains", "price": 349, "discount_percent": 10,
         "description": "Enamel + brass. Small pocket flex, big personality.",
         "material": "Enamel-finished brass",
         "size": "45mm x 15mm",
         "finish": "Polished",
         "images": ["https://images.unsplash.com/photo-1607081692251-b8b7fdd4f6ff?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200",
         "is_featured": True, "is_best_seller": True, "is_limited": True},
        {"name": "Anime Chibi Loop", "category_slug": "keychains", "price": 299,
         "description": "Miniature panel art on a keyring. Under-the-radar drop.",
         "material": "Acrylic + steel loop",
         "size": "50mm",
         "finish": "Double-sided print",
         "images": ["https://images.unsplash.com/photo-1580618432485-1e2f26bfd5e6?w=1200"],
         "lifestyle_image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200",
         "is_trending": True, "is_new": True},
    ]
    for p in products_seed:
        doc = {
            "id": new_id(),
            "slug": slugify(p["name"]),
            "name": p["name"],
            "description": p["description"],
            "category_slug": p["category_slug"],
            "price": p["price"],
            "discount_percent": p.get("discount_percent", 0),
            "stock_quantity": p.get("stock_quantity", 25),
            "images": p["images"],
            "lifestyle_image": p.get("lifestyle_image"),
            "material": p.get("material", "Premium 250gsm matte paper"),
            "size": p.get("size", "A3 (11.7 x 16.5 in)"),
            "finish": p.get("finish", "Matte, museum-grade ink"),
            "is_featured": p.get("is_featured", False),
            "is_trending": p.get("is_trending", False),
            "is_best_seller": p.get("is_best_seller", False),
            "is_new": p.get("is_new", False),
            "is_limited": p.get("is_limited", False),
            "visibility": "published",
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        await db.products.insert_one(doc)
    log.info("Seeded %d products", len(products_seed))


@app.on_event("startup")
async def on_startup():
    await seed_if_empty()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api.get("/")
async def root():
    return {"name": "Paper & Loop API", "status": "alive"}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
