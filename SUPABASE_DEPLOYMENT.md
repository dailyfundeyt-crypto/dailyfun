# Supabase Functions Deployment Anleitung

## 🚀 Edge Functions auf Supabase deployen

Da die Functions bereits in Git committed sind, müssen Sie sie jetzt auf Supabase deployen.

### Option A: Über Supabase Dashboard (Empfohlen)

1. **Öffnen Sie das Supabase Dashboard**
   - Gehen Sie zu: https://app.supabase.com
   - Wählen Sie Ihr Projekt aus

2. **Navigieren zu Edge Functions**
   - Klicken Sie in der linken Seitenleiste auf "Edge Functions"

3. **Function 1: list-users deployen**
   - Klicken Sie auf "Create a new function"
   - Name: `list-users`
   - Kopieren Sie den Inhalt aus: `supabase/functions/list-users/index.ts`
   - Klicken Sie auf "Deploy function"

4. **Function 2: toggle-user deployen**
   - Wiederholen Sie den Vorgang für die zweite Function
   - Name: `toggle-user`
   - Kopieren Sie den Inhalt aus: `supabase/functions/toggle-user/index.ts`
   - Klicken Sie auf "Deploy function"

### Option B: Über Supabase CLI

Wenn Sie die CLI installieren möchten:

```bash
# 1. Installieren Sie die Supabase CLI
npm install -g supabase
# oder
scoop install supabase

# 2. Login zu Supabase
supabase login

# 3. Link zu Ihrem Projekt
supabase link --project-ref [IHR-PROJECT-REF]

# 4. Deploy alle Functions
supabase functions deploy list-users
supabase functions deploy toggle-user
```

### ✅ Überprüfung

Nach dem Deployment sollten Sie:

1. Im Supabase Dashboard unter "Edge Functions" beide Functions sehen
2. Die Functions sollten den Status "Active" haben
3. Testen Sie die Admin-Seite in Ihrer App unter `/admin`

### 🔑 Wichtige Environment Variables

Die Functions benötigen automatisch folgende Environment Variables (diese werden von Supabase bereitgestellt):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Diese müssen Sie **nicht** manuell setzen.

### 📝 Notiz

Die Admin-Seite verwendet diese Functions, um:
- **list-users**: Alle Benutzer anzuzeigen
- **toggle-user**: Benutzer zu sperren/entsperren

---

**Bereits commited und auf GitHub:** ✅
**Noch zu tun:** Deployen auf Supabase
