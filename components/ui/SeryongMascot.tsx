import Image from "next/image";

import seryongImage from "@/assets/seryong.png";

type SeryongMascotProps = {
  className?: string;
  sizes?: string;
};

export function SeryongMascot({ className, sizes = "128px" }: SeryongMascotProps) {
  return (
    <Image
      src={seryongImage}
      alt=""
      width={1254}
      height={1254}
      sizes={sizes}
      className={`seryong-image${className ? ` ${className}` : ""}`}
    />
  );
}
