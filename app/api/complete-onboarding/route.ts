import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
    const supabaseAdmin = createSupabaseAdminClient();
    try {
        const body = await req.json();
        const { userId, orgCode, designation } = body;

        // 1. Validate all incoming data.
        if (!userId || !orgCode || !designation) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        if (orgCode.length !== 6) {
             return NextResponse.json({ error: "Organization code must be 6 characters." }, { status: 400 });
        }

        // 2. Find the organization by its unique code.
        const { data: organization, error: orgError } = await supabaseAdmin
            .from("organizations")
            .select("id")
            .eq("organization_code", orgCode.toUpperCase())
            .single();

        // If no organization is found, return a clear error.
        if (orgError || !organization) {
            return NextResponse.json({ error: "Organization with that code not found." }, { status: 404 });
        }

        // 3. Check if the user is already part of an organization to prevent errors.
         const { data: existingMember, error: memberCheckError } = await supabaseAdmin
            .from("organization_members")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

        if (memberCheckError) {
            console.error("Onboarding - Member Check Error:", memberCheckError);
            throw new Error("Database error checking for existing membership.");
        };

        if (existingMember) {
            return NextResponse.json({ error: "You are already a member of an organization." }, { status: 409 }); // 409 Conflict is a good status code here.
        }

        // 4. Create the link between the user and the organization in the `organization_members` table.
        const { error: memberError } = await supabaseAdmin
            .from("organization_members")
            .insert({
                organization_id: organization.id,
                user_id: userId,
                role: "member", // Users joining via code get a default role of "member".
            });
        
        if (memberError) {
             console.error("Onboarding - Member Insert Error:", memberError);
             // Check for a unique constraint violation specifically.
             if (memberError.code === '23505') {
                 return NextResponse.json({ error: "You are already a member of this organization." }, { status: 409 });
             }
            throw new Error("Could not add user to the organization.");
        }

        // 5. Finally, update the user's `profiles` table with their designation.
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ designation: designation })
            .eq("id", userId);
        
        if (profileError) {
            // This is not a critical failure. The user is in the org but their title wasn't set.
            // We log it for debugging but still return a success message.
            console.warn(`Onboarding: User ${userId} joined org ${organization.id}, but failed to update designation. Error: ${profileError.message}`);
        }
        
        // If all steps succeed, return a success message.
        return NextResponse.json({ message: "Onboarding complete!" }, { status: 200 });

    } catch (error) {
        console.error("Onboarding API Route Error:", (error as Error).message);
        return NextResponse.json({ error: (error as Error).message || "An internal server error occurred." }, { status: 500 });
    }
}