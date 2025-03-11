export const dynamic = "force-static";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-screen relative mx-auto flex w-full flex-col items-center overflow-x-hidden">
      {children}
    </div>
  );
}
