import Image from "next/image";

import seryongImage from "@/assets/seryong.png";

type SeryongMascotProps = {
  className?: string;
  eager?: boolean;
  sizes?: string;
};

export function SeryongMascot({ className, eager = false, sizes = "128px" }: SeryongMascotProps) {
  return (
    <Image
      src={seryongImage}
      alt=""
      width={1254}
      height={1254}
      loading={eager ? "eager" : "lazy"}
      sizes={sizes}
      className={`seryong-image${className ? ` ${className}` : ""}`}
    />
  );
}
