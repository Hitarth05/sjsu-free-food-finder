import Header from "@/components/Header";
import EventFeed from "@/components/EventFeed";
import EmailSubscribe from "@/components/EmailSubscribe";
import PushNotifButton from "@/components/PushNotifButton";
 
export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
 
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <EventFeed />
 
          <aside className="space-y-5 order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <div className="space-y-5">
                <PushNotifButton />
                <EmailSubscribe />
 
                <div className="bg-white rounded-2xl border border-[var(--card-border)] p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">How it works</h3>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    We automatically scan SJSU event listings every few hours and
                    use AI to detect events offering free food or free stuff. No
                    account needed.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
 
      <footer className="border-t border-[var(--card-border)] mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Built by SJSU students. Not affiliated with SJSU.
          </p>
        </div>
      </footer>
    </div>
  );
}
 