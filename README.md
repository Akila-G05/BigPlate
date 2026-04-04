# 🍽️ Big Plate - Food Delivery App

A full-featured food delivery application for **Big Plate Restaurant** (Sri Lanka) built with **React Native (Expo)** and **Supabase**.

## ✨ Features

### 🔐 Authentication & Profile
- **Sign Up / Login** – Full auth flow with Supabase Auth
- **Forgot Password** – Email reset link functionality
- **Profile Details** – Edit name/phone, disabled email field
- **Address Management** – Add/edit/delete addresses, set default, city dropdown
- **Sign Out / Delete Account** – Secure logout and data cleanup

### 🍔 Menu & Discovery
- **Home Screen** – Hero banner, categories, trending items, promo banner
- **Menu Screen** – Search, category filtering, pull-to-refresh, animations
- **Item Details** – Full image, description, spice level, prep time, tags, favorites
- **Favorites** – Save/remove dishes, synced to database

### 🛒 Cart & Checkout
- **Hybrid Cart** – AsyncStorage for guests, Supabase for logged-in users, auto-merge on login
- **Branch Selection** – Filters branches by delivery zone (disabled if no delivery)
- **Delivery Details** – Auto-filled from address, phone, instructions
- **Promo Codes** – Item-specific validation, minimum order checks, dynamic discount calculation
- **Payment Methods** – Cash on Delivery, Card (placeholder)

### 📦 Orders & Tracking
- **Order Placement** – Creates order + items + notification in DB
- **Order History** – Active & past orders, expandable details, reorder button
- **Status Tracking** – 5-step flow (Pending → Confirmed → Preparing → On the Way → Delivered)
- **City-Based ETA** – Dynamic delivery time based on user's location

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
  item/            # Item Detail screen
  profile/         # Profile Details screen
  address/         # Address Management
  favorites/       # Favorites list
  promotions/      # Deals & promo codes
  notifications/   # In-app notifications
  settings/        # App settings & toggles

src/
  context/         # Auth, Cart, Theme, Notifications, Push Notifications
  lib/             # Supabase client, database helpers
  components/      # FoodImage, Skeleton, CustomAlert
  types/           # TypeScript interfaces & constants
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
   - `supabase-seed-notifications.sql` (Sample notifications)

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

4. **Run the Database Trigger SQL**
   (See the "Step 6" section in the project documentation).

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is private and proprietary.
