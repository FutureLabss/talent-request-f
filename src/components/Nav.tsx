import Image from "next/image";
import Link from "next/link";

export default function Nav() {
  return (
    <Link href="/">
      <Image
        src={"/Futurelabs-logo.png"}
        alt="futurelabs logo"
        width={153}
        height={29}
        className="h-auto focus:outline-none outline-none"
      />
    </Link>
  );
}
