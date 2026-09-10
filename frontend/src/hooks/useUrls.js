import { useState, useEffect, useCallback } from "react";
import { fetchAllUrls, deleteUrl as deleteUrlApi } from "../api/urlApi";

export function useUrls() {
  const [urls, setUrls]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllUrls();
      setUrls(data);
    } catch {
      setError("Could not load URLs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = useCallback(async (url) => {
    const code = url.shortCode || url.shortId || url.code;
    await deleteUrlApi(code);
    setUrls((prev) => prev.filter((u) => (u.shortCode || u.shortId || u.code) !== code));
  }, []);

  return { urls, loading, error, reload: load, remove };
}
