interface CityComingSoonProps {
  cityName: string;
}

export default function CityComingSoon({
  cityName,
}: CityComingSoonProps) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-[32px] border bg-white p-12 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
          NearbyNow
        </p>

        <h1 className="mt-5 text-5xl font-black tracking-tight">
          Coming Soon
        </h1>

        <p className="mt-5 text-lg text-neutral-600">
          NearbyNow is currently live only in{" "}
          <span className="font-bold text-black">
            Durgapur
          </span>.
        </p>

        <p className="mt-3 text-neutral-500">
          We are working to launch in{" "}
          <span className="font-semibold text-black">
            {cityName}
          </span>{" "}
          soon.
        </p>

        <div className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white">
          More cities coming soon
        </div>
      </div>
    </main>
  );
}
