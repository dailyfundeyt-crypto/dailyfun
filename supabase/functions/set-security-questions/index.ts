import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityQuestion {
  question: string;
  answer: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { questions }: { questions: SecurityQuestion[] } = await req.json();

    if (!Array.isArray(questions) || questions.length !== 3) {
      return new Response(
        JSON.stringify({ error: "Du musst genau 3 Sicherheitsfragen beantworten" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete old questions
    await supabaseClient.from("security_questions").delete().eq("user_id", user.id);

    // Hash answers and insert
    const email = user.email || "";
    for (const q of questions) {
      const hash = await bcrypt.hash(q.answer.toLowerCase().trim());
      await supabaseClient.from("security_questions").insert({
        user_id: user.id,
        email: email,
        question: q.question,
        answer_hash: hash,
      });
    }

    return new Response(
      JSON.stringify({ message: "Sicherheitsfragen erfolgreich gespeichert" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in set-security-questions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
