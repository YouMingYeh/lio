import Image from "next/image";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer id="footer" className="z-10 w-full">
      <div className="bg-muted border border-t p-16 md:px-24 lg:px-32">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4 xl:grid-cols-6">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex items-center font-bold">
              <Image
                src="/logo.png"
                className="rounded"
                alt="Logo"
                width={64}
                height={64}
              />

              <h3 className="sr-only text-2xl">Lio</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">關於</h3>
            <div>
              <Link href="/home" className="opacity-60 hover:opacity-100">
                主頁
              </Link>
            </div>
            <div>
              <Link href="/blog" className="opacity-60 hover:opacity-100">
                部落格
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">幫助</h3>
            <div>
              <Link
                href="https://line.me/R/ti/p/@752pcsxu"
                className="opacity-60 hover:opacity-100"
              >
                問題回報或回饋意見？請直接與我們的官方帳號聯繫！
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">政策</h3>
            <div>
              <Link href="/privacy" className="opacity-60 hover:opacity-100">
                隱私權政策
              </Link>
            </div>

            <div>
              <Link href="/terms" className="opacity-60 hover:opacity-100">
                服務條款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
