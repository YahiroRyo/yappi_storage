import { redirect } from "next/navigation";

export default function Home() {
  return redirect("/drive/root");
}
