# 🍽️ Big Plate - Food Delivery App

A full-featured food delivery application for **Big Plate Restaurant** (Sri Lanka) built with **React Native (Expo)** and **Supabase**.

## ✨ Features

### 🔐 Authentication & Profile
- **Sign Up / Login** – Full auth flow with Supabase Auth
- **Forgot Password** – 3-step verification: Email → 6-digit Code → New Password
- **Profile Details** – Edit name/phone, disabled email field
- **Address Management** – Add/edit/delete addresses, set default, city dropdown
- **Sign Out / Delete Account** – Secure logout and data cleanup

### 🍔 Menu & Discovery
- **Home Screen** – Hero banner, categories, trending items, promo banner, real stats
- **Menu Screen** – Search, category filtering, pull-to-refresh, animations
- **Item Details** – Full image, description, spice level, prep time, tags, favorites, reviews
- **Favorites** – Save/remove dishes, synced to database

### 🛒 Cart & Checkout
- **Hybrid Cart** – AsyncStorage for guests, Supabase for logged-in users, auto-merge on login
- **Branch Selection** – Filters branches by delivery zone (disabled if no delivery)
- **Delivery Details** – Auto-filled from address, phone, instructions
- **Promo Codes** – 3 types: Item Discounts, Free Delivery, Combos
- **Payment Methods** – Cash on Delivery, Card (placeholder)

### 📦 Orders & Tracking
- **Order Placement** – Creates order + items + notification in DB
- **Order History** – Active & past orders, expandable details, review button
- **Status Tracking** – 5-step flow (Pending → Confirmed → Preparing → On the Way → Delivered)
- **City-Based ETA** – Dynamic delivery time based on user's location
- **Cancel Order** – Delete pending orders with confirmation

### ⭐ Reviews & Ratings
- **Item Reviews** – Rate and review individual menu items
- **Review Management** – Edit previous reviews, view average rating per item
- **Public Reviews** – Visible to all users (guests included)

### ⚙️ Settings & Preferences
- **Dark Mode** – Full app theme support, persists across sessions
- **Notification Toggles** – Push, Email, SMS (synced to database)
- **Clear Cache** – Wipes local data and resets app state
- **Help / Support** – Contact info, rate app, help center

### 🔔 Notifications
- **In-App Bell** – Real-time unread count, mark as read, type-specific colors (Order/Promo/System)
- **Push Notification Setup** – Context provider, token management, Edge Function code ready

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo), Expo Router
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **State Management:** React Context
- **Storage:** AsyncStorage (local), Supabase (cloud)
- **Styling:** StyleSheet, ThemeContext (Dark Mode)

## 📂 Project Structure

```
app/
  (tabs)/          # Main tabs (Home, Menu, Cart, Orders, Profile)
  auth/            # Login, Signup, Forgot Password
  checkout/        # Checkout flow, Order Confirmation
  item/            # Item Detail screen with reviews
  profile/         # Profile Details screen
  review/          # Order review screen
  address/         # Address Management
  favorites/       # Favorites list
  promotions/      # Deals & promo codes (Combos, Discounts, Free Delivery)
  notifications/   # In-app notifications
  settings/        # App settings & toggles

src/
  context/         # Auth, Cart, Theme, Notifications, Push Notifications
  lib/             # Supabase client, database helpers
  components/      # FoodImage, Skeleton, CustomAlert
  types/           # TypeScript interfaces & constants
  utils/           # Validation helpers
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app on your physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akilagimhana2005-cmyk/big-plate.git
   cd big-plate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npx expo start
   ```

4. **Scan the QR code** with the Expo Go app on your phone.

## 🗄️ Database Setup

1. Go to your Supabase project dashboard.
2. Run the SQL files located in the project root:
   - `supabase-schema.sql` (Main tables & seed data)
   - `supabase-cart.sql` (Cart table)
   - `supabase-cities-branches.sql` (Cities, branches, delivery zones)
   - `supabase-order-notification-trigger.sql` (Order status trigger)
   - `supabase-notifications.sql` (Notifications table)
   - `supabase-reviews.sql` (Reviews table)

## 🔐 Forgot Password Setup

The app uses a 3-step verification flow: **Email → Code → New Password**.

1. **Create the verification codes table:**
   ```sql
   create table password_reset_codes (
     id uuid default gen_random_uuid() primary key,
     email text not null,
     code text not null,
     expires_at timestamp with time zone not null,
     created_at timestamp with time zone default now()
   );

   alter table password_reset_codes enable row level security;
   create policy "Public insert reset codes" on password_reset_codes for insert with check (true);
   create policy "Public select reset codes" on password_reset_codes for select using (true);
   ```

2. **Deploy the Edge Function (`smooth-worker`):**
   - Go to **Supabase Dashboard → Edge Functions → `smooth-worker`**
   - Paste the code from `supabase/functions/generate-reset-code/index.ts`
   - Add these secrets:
     - `PROJECT_URL` → `https://dpqgagiwqxqhfusoppzi.supabase.co`
     - `SERVICE_KEY` → Your `service_role` key
     - `RESEND_API_KEY` → Your Resend API key (for sending emails)

3. **How it works:**
   - User enters email → 6-digit code is generated and emailed
   - User enters code → Verified against database (5-min expiry)
   - User sets new password → Updated via Supabase Admin API

## 📱 Push Notifications (Setup Guide)

To enable push notifications, you need to deploy the Supabase Edge Function.

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and Link Project**
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

3. **Deploy the Function**
   ```bash
   supabase functions deploy send-push-notification
   ```

## 📥 Download APK

You can download the latest Android APK from Google Drive:
👉 **[Download Big Plate APK](https://drive.google.com/drive/u/1/folders/1XyHUHkMqjCCqdfJl_We92a98vozXFuSF)**

## 🚧 Upcoming Features

- **Email Notifications** – Order updates and promotions via email
- **SMS Notifications** – Delivery alerts via text message
- **Admin Dashboard** – Web interface to manage orders, menu items, and promotions
- **Payment Gateway** – Online payment integration (Stripe/PayHere)

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is private and proprietary.
