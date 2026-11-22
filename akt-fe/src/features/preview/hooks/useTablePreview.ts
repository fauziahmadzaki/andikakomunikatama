"use client";

import { useState } from "react";

export function useTablePreview() {
  const [page, setPage] = useState(2);

  return {
    page,
    setPage,
  };
}
