import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Answer {
  question: string;
  answer: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, answers, newPassword }: { email: string; answers: Answer[]; newPassword: string } =
      await req.json();

    if (!email || !answers || answers.length !== 3 || !newPassword) {
      return new Response(
        JSON.stringify({ error: "E-Mail, Antworten und neues Passwort erforderlich" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: authUser } = await supabaseAdmin.auth.admin.listUsers();
    const user = authUser?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return new Response(JSON.stringify({ error: "Benutzer nicht gefunden" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: questions, error } = await supabaseAdmin
      .from("security_questions")
      .select("*")
      .eq("user_id", user.id);

    if (error || !questions || questions.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Keine Sicherheitsfragen gefunden" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify all answers
    let allCorrect = true;
    for (const ans of answers) {
      const q = questions.find((sq) => sq.question === ans.question);
      if (!q) {
        allCorrect = false;
        break;
      }
      const match = await bcrypt.compare(ans.answer.toLowerCase().trim(), q.answer_hash);
      if (!match) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      return new Response(
        JSON.stringify({ error: "Eine oder mehrere Antworten sind falsch" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Reset password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ message: "Passwort erfolgreich zurückgesetzt" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password-by-questions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
