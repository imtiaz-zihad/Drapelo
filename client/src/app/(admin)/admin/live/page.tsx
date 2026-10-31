import LiveVisitors from "./LiveVisitors";

export default function LivePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Live visitors</h1>
        <p className="text-muted-foreground">
          Website-e ekhon je-ra active (10 sec-e refresh hoy)
        </p>
      </div>

      <div className="max-w-md">
        <LiveVisitors />
      </div>
    </div>
  );
}