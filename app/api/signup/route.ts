import { NextResponse } from "next/server"
import { createProfile, createOrganization, joinOrganizationByCode } from "@/lib/database"

export async function POST(req: Request) {
  console.log("Received request for /api/signup")
  try {
    const body = await req.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const { userId, fullName, email, organizationType, organizationCode, organizationData } = body

    if (!userId || !fullName || !email) {
      console.error("Missing user information: userId, fullName, or email")
      return NextResponse.json(
        { error: "Missing user information: userId, fullName, or email required." },
        { status: 400 },
      )
    }

    // 1. Create the user profile
    console.log(`Attempting to create profile for userId: ${userId}, fullName: ${fullName}, email: ${email}`)
    try {
      await createProfile(userId, fullName, email)
      console.log(`Profile created successfully for userId: ${userId}`)
    } catch (profileError) {
      console.error(`Error creating profile for userId ${userId}:`, profileError)
      return NextResponse.json(
        { error: `Profile creation failed: ${(profileError as Error).message}` },
        { status: 500 },
      )
    }

    // 2. Handle organization
    if (organizationType === "new") {
      if (!organizationData) {
        console.error("Missing organization data for 'new' organization type.")
        return NextResponse.json({ error: "Missing organization data for new organization." }, { status: 400 })
      }
      console.log(
        `Attempting to create new organization for userId: ${userId} with data:`,
        JSON.stringify(organizationData, null, 2),
      )
      try {
        const org = await createOrganization(userId, organizationData)
        console.log(`New organization created successfully. ID: ${org.id}, Code: ${org.organization_code}`)
        return NextResponse.json(
          { message: "User and new organization created successfully.", organizationCode: org.organization_code },
          { status: 200 },
        )
      } catch (orgCreateError) {
        console.error(`Error creating new organization for userId ${userId}:`, orgCreateError)
        return NextResponse.json(
          { error: `New organization creation failed: ${(orgCreateError as Error).message}` },
          { status: 500 },
        )
      }
    } else if (organizationType === "existing") {
      if (!organizationCode) {
        console.error("Missing organization code for 'existing' organization type.")
        return NextResponse.json(
          { error: "Missing organization code for joining existing organization." },
          { status: 400 },
        )
      }
      console.log(`Attempting to join existing organization for userId: ${userId} with code: ${organizationCode}`)
      try {
        await joinOrganizationByCode(userId, organizationCode)
        console.log(`User ${userId} successfully joined organization with code ${organizationCode}`)
        return NextResponse.json({ message: "User created and successfully joined organization." }, { status: 200 })
      } catch (orgJoinError) {
        console.error(`Error joining organization for userId ${userId} with code ${organizationCode}:`, orgJoinError)
        return NextResponse.json(
          { error: `Joining organization failed: ${(orgJoinError as Error).message}` },
          { status: 500 },
        )
      }
    } else {
      console.error("Invalid organization type provided:", organizationType)
      return NextResponse.json({ error: "Invalid organization type. Must be 'new' or 'existing'." }, { status: 400 })
    }
  } catch (error) {
    console.error("Unexpected error in /api/signup:", error)
    let errorMessage = "An unexpected error occurred during signup."
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
