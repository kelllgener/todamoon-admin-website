import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./UserContext";
import { fetchUserData } from "@/app/utils/firestoreUtils"; // Import the utility function

export const useAuth = () => {
  const { user, loading: userLoading } = useUser();
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace("/login"); // Redirect to login if not authenticated
    } else if (user) {
      // Fetch user data when user is available
      (async () => {
        try {
          const data = await fetchUserData(user);
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
        setLoading(false);
      })();
    }
  }, [user, userLoading, router]);

  return { user, loading, userData };
};
