export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API Error");
    return data.data as T;
  }
  