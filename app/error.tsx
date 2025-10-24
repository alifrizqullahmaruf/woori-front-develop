"use client"
import PageViewContainer from "./_common/component/templates/PageViewContainer";
import ErrorImg from "@/public/images/error.png";
import Image from "next/image";


export default function Error() {
  const handleConfirm = () => {
    window.location.href = "/";
  };

  return (
    <PageViewContainer
      verticalPadding={{ top: 16, bottom: 72 }}
      className={"flex flex-col items-center gap-[24px]"}
    >
      <Image src={ErrorImg} alt="" className="h-[57px] w-[57px] mt-7" />
      <p className="text-center text-xl">
        서비스 점검 중입니다. 
        <br />
        더 나은 서비스를 위해 잠시 쉬어갈게요.
      </p>
      <button
        onClick={handleConfirm}
        style={{
          backgroundColor: "#2589F4",
          padding: "10px 20px",
          borderRadius: "8px",
          color: "white",
        }}
        className="mt-auto w-[312px] text-xl"
      >
        확인
      </button>
    </PageViewContainer>
  );
}
