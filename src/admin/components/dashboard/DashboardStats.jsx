import StatCard from "./StatCard";

const DashboardStats = ({
  totalProducts,
  totalUsers,
  totalOrders,
  totalRevenue,
}) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Products"
        value={totalProducts}
        subtitle="Products in catalogue"
        number="01"
      />

      <StatCard
        title="Total Users"
        value={totalUsers}
        subtitle="Registered customers"
        number="02"
      />

      <StatCard
        title="Total Orders"
        value={totalOrders}
        subtitle="Orders placed"
        number="03"
      />

      <StatCard
        title="Total Revenue"
        value={`₹${totalRevenue.toLocaleString(
          "en-IN"
        )}`}
        subtitle="Revenue from orders"
        number="04"
      />

    </section>
  );
};

export default DashboardStats;