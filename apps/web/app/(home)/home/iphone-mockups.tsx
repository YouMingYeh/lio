import Image from "next/image";

export default function IPhoneMockups() {
  return (
    <div className="relative mx-auto flex justify-center items-center py-8">
      <div className="flex items-center justify-center">
        {/* Left iPhone - smaller and angled */}
        <div className="relative transform -translate-x-4 -rotate-6 opacity-90">
          <div className="rounded-[24px] bg-gray-900 p-1.5 shadow-xl">
            <div className="rounded-[20px] overflow-hidden border-gray-900 bg-white">
              <Image
                src="/b.png"
                width={300}
                height={640}
                alt="App Screenshot 1"
                className="object-cover"
                priority={false}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </div>
        </div>

        {/* Center iPhone - main focus */}
        <div className="relative z-10">
          <div className="rounded-[24px] bg-gray-900 -translate-y-4 p-1.5 shadow-xl">
            <div className="rounded-[20px] overflow-hidden border-gray-900 bg-white">
              <Image
                src="/a.png"
                width={340}
                height={690}
                alt="App Screenshot 2"
                className="object-cover"
                priority={true}
                sizes="(max-width: 768px) 100vw, 340px"
              />
            </div>
          </div>
        </div>

        {/* Right iPhone - smaller and angled */}
        <div className="relative transform translate-x-4 rotate-6 opacity-90">
          <div className="rounded-[24px] bg-gray-900 p-1.5 shadow-xl">
            <div className="rounded-[20px] overflow-hidden border-gray-900 bg-white">
              <Image
                src="/c.png"
                width={300}
                height={640}
                alt="App Screenshot 3"
                className="object-cover"
                priority={false}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
