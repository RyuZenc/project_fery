const BASE_URL = "https://story-api.dicoding.dev/v1";
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

export async function subscribeUser() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // 🔹 Bersihkan data sebelum dikirim
    const data = subscription.toJSON();
    delete data.expirationTime;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) throw new Error("Token tidak ditemukan.");

    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal subscribe.");

    console.log("✅ Berhasil subscribe push:", result);
    alert("Berhasil berlangganan notifikasi!");
    return result;
  } catch (error) {
    console.error("❌ Gagal subscribe push:", error);
    alert(`Gagal subscribe: ${error.message}`);
  }
}

export async function unsubscribeUser() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return alert("Belum berlangganan notifikasi.");

    const data = subscription.toJSON();
    delete data.expirationTime;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.token) throw new Error("Token tidak ditemukan.");

    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ endpoint: data.endpoint }),
    });

    await subscription.unsubscribe();
    const result = await response.json();
    console.log("✅ Berhasil unsubscribe:", result);
    alert("Berhasil berhenti berlangganan notifikasi!");
  } catch (error) {
    console.error("❌ Gagal unsubscribe:", error);
    alert(`Gagal unsubscribe: ${error.message}`);
  }
}

export async function checkSubscribed() {
  const registration = await navigator.serviceWorker.ready;
  const sub = await registration.pushManager.getSubscription();
  return !!sub;
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
