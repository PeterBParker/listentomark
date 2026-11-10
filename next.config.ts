import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// The dev server only serves its JavaScript to pages opened via localhost
// unless other hosts are listed here. Without this, opening the app from a
// phone at http://<this-computer's-IP>:3000 shows the page but nothing
// interactive works (player, date filter, ...). Allow this machine's own
// network addresses and *.local names. Production builds aren't affected.
const localAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...localAddresses, "*.local"],
};

export default nextConfig;
