import { prisma } from "@/lib/prisma";
import { countryFromRequest } from "@/lib/geo/countryFromRequest";
import { isValidCountryCode } from "@/lib/geo/validCountryCode";

export async function countryForGeoEvent(
  request: Request,
  userId?: string | null
): Promise<string> {
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { countryCode: true },
    });
    const code = user?.countryCode;
    if (code && isValidCountryCode(code)) {
      return code;
    }
  }

  return countryFromRequest(request);
}
