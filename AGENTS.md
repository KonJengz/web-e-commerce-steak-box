<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

# Project Architecture & AI Guidelines

## 1. Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router ONLY).
- **Backend**: Rust (Existing API for Data & DB).
- **Pattern**: Backend-For-Frontend (BFF).

## 2. Authentication Flow (BFF Pattern)

- **Login/OAuth**: Next.js Client receives credentials/tickets -> Sends to Next.js **Server Actions**.
- **Proxy to Rust**: The Server Action acts as a proxy, sending the HTTP request to the Rust Backend.
- **Token Storage**: Upon success, Rust returns a Token. Next.js MUST set this token in an **HttpOnly Cookie**.
- **STRICT RULE**: NEVER store authentication tokens in Zustand, LocalStorage, or any Client-side state.
- **Route Protection**: Use `proxy.ts` (Next.js 16 standard) at the root of the project to intercept requests, read cookies, and verify authorization before allowing access to Private Routes (e.g., `/app/(account)/*`, `/app/admin/*`, `/checkout`). **DO NOT use the legacy `middleware.ts`**.

## 3. Coding Guidelines & Philosophy

- **Server-First Approach**: Default to Server Components (`React Server Components`). Only use Client Components (`"use client"`) when strictly necessary (e.g., interactivity, hooks).
- **DRY (Don't Repeat Yourself)**: Create reusable helper functions, hooks, and components.
- **Clean Code & Separation of Concerns**: Keep business logic out of UI components. Extract logic to custom hooks or utility files.
- **Scalability**: Structure code and folders in a modular way (feature-based routing).
- **Performance & Caching**: Utilize Next.js App Router caching mechanisms effectively.
- **Strict Typing**: TypeScript is mandatory. ALL variables, function parameters, and return types MUST have explicit types defined. Avoid `any`.

## 4. Environment & Styling Configuration

- **Environment Variables**: All env variables MUST be validated using Zod.
  - `src/config/env.server.ts`: For server-side only secrets (e.g., `BACKEND_URL`). NEVER import this in `"use client"` files.
  - `src/config/env.client.ts`: For client-side safe variables (e.g., `NEXT_PUBLIC_APP_URL`).
- **Global Styles & Fonts**: Put global CSS in `src/styles/globals.css` and configure Next.js fonts in `src/styles/fonts.ts`. Import them into the root layout.

## 5. API & Error Handling

- **API Wrapper**: Always use the provided custom `apiFetch` wrapper (e.g., `api.get`, `api.post`) located in `src/lib/api/client.ts` instead of native `fetch`.
- **Error Handling**: Handle `ApiError` appropriately. Always use `isRedirectError` from `next/dist/client/components/redirect` to prevent `try/catch` blocks from swallowing Next.js redirects.

## 6. Service Layer Pattern

- **Abstraction**: NEVER call the `api` wrapper directly inside UI Components or Server Actions. All API calls MUST be abstracted into a dedicated **Service Layer**.
- **Typing**: Input parameters MUST use types inferred from Zod schemas. Responses MUST have clearly defined TypeScript interfaces.
- **Implementation Pattern**: Group related endpoints into a single exported service object:

```typescript
// Standard Service Layer Pattern
import { api } from "@/lib/api/client";
import { RegisterInput, LoginInput } from "@/features/auth/schemas/auth.schema";
import { User } from "@/features/user/types/user.type";

export interface LoginResponse {
  accessToken: string;
  expiresIn?: number;
  user: User;
}

const register = async (data: RegisterInput) => {
  return api.post<void>("/auth/register", data);
};

const login = async (data: LoginInput) => {
  return api.post<LoginResponse>("/auth/login", data);
};

export const authService = {
  register,
  login,
};
```

## 7. Forms & Validation

- **Libraries**: Use **Zod** for schema validation and **React Hook Form** for form state management.
- **Implementation Pattern**: Always use the `Controller` pattern with Shadcn UI components as shown below:

```tsx
// Standard Form Field Pattern
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";

<Controller
  control={control}
  name="email"
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
      <Input
        {...field}
        id={field.name}
        placeholder="Email"
        aria-invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>;
```

## 8. Folder Structure (Feature-Based)

For this E-commerce project, ALWAYS follow this directory structure. Do not create isolated files that break this pattern.

```text
src/
├── app/ # 🌐 Next.js App Router (Routing & Pages)
│ ├── (shop)/ # กลุ่มหน้าสำหรับลูกค้าทั่วไป
│ │ ├── page.tsx # หน้า Home (แสดงรายการสินค้า /api/products)
│ │ ├── products/[id]/page.tsx # หน้า Product Detail + Images
│ │ └── categories/[id]/page.tsx # หน้าแสดงสินค้าตามหมวดหมู่
│ ├── (auth)/ # กลุ่มหน้าระบบสมาชิก
│ │ ├── login/page.tsx # ฟอร์ม Login
│ │ ├── register/page.tsx # ฟอร์ม Register
│ │ ├── verify-email/page.tsx # หน้ากรอก Code ยืนยัน Email
│ │ └── oauth/callback/page.tsx # หน้าสำหรับรับ Redirect จาก Google/GitHub OAuth
│ ├── (account)/ # กลุ่มหน้าจัดการข้อมูลส่วนตัว (ต้อง Login)
│ │ ├── profile/page.tsx # แสดง/แก้ไข Profile และขอเปลี่ยน Email
│ │ ├── addresses/page.tsx # จัดการที่อยู่ (CRUD /api/addresses)
│ │ └── orders/page.tsx # ประวัติการสั่งซื้อและรายละเอียด (User Orders)
│ ├── cart/ # หน้าตะกร้าสินค้า
│ │ └── page.tsx # สรุปรายการในตะกร้า (/api/carts)
│ ├── checkout/ # หน้าชำระเงิน
│ │ └── page.tsx # เลือกที่อยู่และกดสั่งซื้อ (Create Order)
│ ├── admin/ # 🔒 โซนหลังบ้านสำหรับ Admin (Route Protection)
│ │ ├── dashboard/page.tsx
│ │ ├── products/page.tsx # จัดการสินค้า (เพิ่ม/ลบ/แก้ไข/อัปโหลดรูป)
│ │ └── categories/page.tsx # จัดการหมวดหมู่สินค้า
│ ├── proxy.ts # 🛡️ Intercept Request อ่าน Cookie ตรวจสอบสิทธิ์ (User/Admin)
│ └── layout.tsx # Root Layout (รวม Header/Footer)
│
├── features/ # 🧠 Core Business Domains (ตรรกะและ Service)
│ ├── auth/
│ │ ├── components/ # LoginForm, RegisterForm, OAuthButtons
│ │ ├── schemas/ # Zod: LoginSchema, RegisterSchema, VerifySchema
│ │ ├── services/ # authService (login, register, verify, oauthExchange)
│ │ └── types/ # AuthResponse, OAuthTicket
│ ├── user/
│ │ ├── schemas/ # Zod: UpdateEmailSchema
│ │ ├── services/ # userService (getMe, updateEmail)
│ │ └── types/ # User (id, email, role)
│ ├── address/
│ │ ├── components/ # AddressList, AddressFormModal
│ │ ├── schemas/ # Zod: AddressSchema
│ │ └── services/ # addressService (getAll, create, update, delete)
│ ├── product/
│ │ ├── components/ # ProductCard, ProductGallery, AdminProductForm
│ │ ├── schemas/ # Zod: ProductQuerySchema, AdminProductSchema
│ │ ├── services/ # productService (getAll, getById, adminCRUD, uploadImage)
│ │ └── types/ # Product, ProductImage
│ ├── category/
│ │ ├── components/ # CategorySidebar, AdminCategoryForm
│ │ ├── schemas/ # Zod: CategorySchema
│ │ └── services/ # categoryService (getAll, adminCreate)
│ ├── cart/
│ │ ├── components/ # CartItem, CartSummary
│ │ ├── schemas/ # Zod: AddToCartSchema, UpdateQuantitySchema
│ │ ├── services/ # cartService (get, addItem, updateItem, remove, clear)
│ │ └── types/ # Cart, CartItem
│ └── order/
│ ├── components/ # OrderHistoryTable, OrderDetailCard
│ ├── schemas/ # Zod: CreateOrderSchema
│ ├── services/ # orderService (create, getAll, getById)
│ └── types/ # Order, OrderItem
│
├── components/ # 🧩 Global Shared Components
│ ├── ui/ # Shadcn UI (Button, Input, Dialog, Form ฯลฯ)
│ ├── layout/ # Navbar, Footer, Sidebar (สำหรับ Admin)
│ └── providers/ # React Query Provider, Theme Provider
│
├── lib/ # 🛠️ Utilities & Configurations
│ ├── api/
│ │ ├── client.ts # ตัว wrapper apiFetch หลัก
│ │ └── error.ts # คลาส ApiError
│ └── utils.ts # ฟังก์ชันช่วยเหลือ เช่น formatPrice(number)
├── config/
│ └── env.validation.ts # Validate environment variables
│ ├── env.server.ts # ตรวจสอบและ Export เฉพาะ Env ของฝั่ง Server (ห้ามใช้ใน "use client")
│ └── env.client.ts # ตรวจสอบและ Export เฉพาะ Env ฝั่ง Client (NEXT_PUBLIC_*)
├── types/ # 🏷️ Global Types (เช่น API Response พื้นฐาน)
│ └── index.ts # PaginatedResponse<T>, ApiErrorResponse
└── styles/
 └── global.css # Global Styles
└── font.ts # Global Fonts
```

**Rule for Features**: Inside each `features/[domain-name]/`, you MUST organize files by their purpose, e.g., `components/`, `services/`, `schemas/`, `types/`, and `hooks/`.

## 9. Mandatory Reading

Before writing or modifying any code related to data fetching, routing, or backend interaction, you MUST:

1. Read the `API_DOCS.md` file carefully to understand the Rust Backend endpoints, parameters, request bodies, and expected responses.
2. Re-read this `AGENTS.md` file to ensure full compliance with the project's architecture, folder structure, and coding standards.

<!-- END:nextjs-agent-rules -->
