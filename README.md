# Karmi HR (Firebase + Login সহ)

কর্মী, হাজিরা, ছুটি ও বেতনের dashboard। GitHub Pages-এ ফ্রি হোস্ট করা যায়।

| ফাইল | কাজ |
|---|---|
| `index.html` | মূল অ্যাপ |
| `backend.js` | Login + Firebase সংযোগ (config না দিলে Local mode) |
| `firebase-config.js` | **এখানে আপনার Firebase config বসাবেন** |
| `firestore.rules` | ডেটা সুরক্ষার নিয়ম (শুধু আপনার ইমেইল ঢুকতে পারবে) |

---

## ধাপ ১: Firebase প্রজেক্ট বানান (ফ্রি)
1. https://console.firebase.google.com → **Add project** → নাম দিন (যেমন `karmi-hr`)। Google Analytics বন্ধ রাখতে পারেন।
2. বাম মেনুতে **Build → Firestore Database → Create database**।
   - Location: `asia-south1 (Mumbai)` (বাংলাদেশের কাছে)।
   - Mode: **Production mode**।

## ধাপ ২: ডেটা সুরক্ষা (Rules)
1. Firestore → **Rules** ট্যাব।
2. `firestore.rules` ফাইলের লেখা সব কপি করে বসান।
3. `you@example.com` ও `partner@example.com`-এর জায়গায় **যাদের ঢুকতে দেবেন তাদের ইমেইল** দিন। দরকার না হলে একটা লাইন মুছে দিন।
4. **Publish** চাপুন।

## ধাপ ৩: Login চালু করুন
1. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable → Save**।
2. **Users** ট্যাবে **Add user** চেপে ইমেইল ও পাসওয়ার্ড দিন (ধাপ ২-এর ইমেইলগুলোই)।
3. **Settings → User actions**-এ **Enable create (sign-up)** টিক তুলে দিন, যাতে বাইরের কেউ নতুন অ্যাকাউন্ট খুলতে না পারে।
4. **Settings → Authorized domains → Add domain**: `yumoo7.github.io` যোগ করুন।

## ধাপ ৪: Config বসান
1. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → অ্যাপ রেজিস্টার করুন (Hosting টিক দিতে হবে না)।
2. যে `firebaseConfig` দেখাবে, তার মানগুলো `firebase-config.js`-এ `PASTE_...`-এর জায়গায় বসান।

## ধাপ ৫: GitHub-এ publish
1. github.com → **New repository** → নাম `karmi-hr` → **Public**।
2. **uploading an existing file**-এ সব ফাইল (`index.html`, `backend.js`, `firebase-config.js`, `firestore.rules`, `.nojekyll`, `README.md`) ড্র্যাগ করে **Commit changes**।
3. **Settings → Pages → Deploy from a branch → main → / (root) → Save**।
4. ১-২ মিনিট পর: `https://yumoo7.github.io/karmi-hr/`

---

## কীভাবে কাজ করে
- সাইটের কোড পাবলিক, কিন্তু **ডেটা পাবলিক না**: login ছাড়া বা তালিকার বাইরের ইমেইল দিয়ে Firestore কিছুই দেবে না।
- সব ডিভাইসে একই ডেটা দেখা যাবে, কারণ ডেটা থাকে Firebase-এ।
- `firebase-config.js` পাবলিক থাকলে সমস্যা নেই। ওটা secret না, সুরক্ষা আসে rules ও login থেকে।
- Config না বসালে সাইট **Local mode**-এ চলে (ডেটা শুধু ওই browser-এ থাকে)।

## ছোট সতর্কতা
- Rules-এর ইমেইল তালিকা ঠিক রাখুন এবং সবল পাসওয়ার্ড দিন।
- Firebase-এর ফ্রি (Spark) quota ছোট HR ব্যবহারে সাধারণত যথেষ্ট। সীমা Firebase সাইটে দেখে নিন।
