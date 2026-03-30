import { Header } from "@/components/layout/header/header";
import { toHeaderUser } from "@/components/layout/header/header-user.utils";
import MainContainer from "@/components/layout/header/main-container";
import { cartService } from "@/features/cart/services/cart.service";
import { CartStateProvider } from "@/features/cart/components/cart-state-provider";
import {
  getCurrentAccessToken,
  getCurrentUser,
} from "@/features/auth/services/current-user.service";
import { ApiError } from "@/lib/api/error";

export default async function MainTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, accessToken] = await Promise.all([
    getCurrentUser(),
    getCurrentAccessToken(),
  ]);
  const user = currentUser ? toHeaderUser(currentUser) : null;
  let initialCart = null;

  if (accessToken) {
    try {
      initialCart = (await cartService.getCurrent(accessToken)).data;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        throw error;
      }
    }
  }

  return (
    <CartStateProvider initialCart={initialCart} isLoggedIn={Boolean(user)}>
      <Header isLoggedIn={Boolean(user)} user={user} />
      <MainContainer>{children}</MainContainer>
    </CartStateProvider>
  );
}
