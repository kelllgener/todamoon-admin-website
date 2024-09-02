import Login from "./login/page";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
