import LoadingDots from "@/app/_common/component/atoms/LoadingDots";
import PageViewContainer from "@/app/_common/component/templates/PageViewContainer";

interface DataStateHandlerProps {
  isLoading: boolean;
  error: Error | null;
  title?: string;
  children: React.ReactNode;
}

export function DataStateHandler({
  isLoading,
  error,
  title,
  children,
}: DataStateHandlerProps) {
  if (isLoading) {
    return (
      <PageViewContainer>
        {title && <h2 className="typo-micro mb-[18px]">{title}</h2>}
        <div className="flex items-center justify-center py-8">
          <LoadingDots />
        </div>
      </PageViewContainer>
    );
  }

  if (error) {
    return (
      <PageViewContainer>
        {title && <h2 className="typo-micro mb-[18px]">{title}</h2>}
        <div className="flex items-center justify-center py-8 text-red-500">
          <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
        </div>
      </PageViewContainer>
    );
  }

  return <>{children}</>;
}