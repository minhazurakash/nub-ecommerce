import { OrdersFilterList } from "@/components/account/orders-filter-list";
import { getUserOrders } from "@/modules/account/queries";
import { getCurrentUser } from "@/modules/auth/actions";

export default async function AccountOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await getUserOrders(user.id);

  return <OrdersFilterList orders={orders} />;
}
