import { Suspense } from "react";
import CompanySearchClient from "./CompanySearchClient";

export default function CompanySearchPage() {
  return (
    <Suspense fallback={<div />}>
      <CompanySearchClient />
    </Suspense>
  );
}

