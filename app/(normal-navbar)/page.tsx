import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { currentUser } from "@/lib/auth";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <Card className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            First Responder Team - LLIS
          </h1>
          <p className="text-gray-500 mt-2">
            Supporting the school community through preparedness and action.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center">
            Welcome to the First Responder Team&apos;s home page. We are dedicated to
            ensuring the safety and well-being of the school community through
            immediate response and thorough preparedness. Whether you&apos;re a
            visitor or team member, explore how we make a difference every day.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
