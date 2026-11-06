import { describe, it, expect } from "vitest";
import { getOverdueRequests } from "./OverdueRequestsCard";
import type { ApiRequest } from "@/hooks/useRequests";

const NOW = new Date("2026-11-06T12:00:00Z").getTime();
const DAY = 24 * 60 * 60 * 1000;

const req = (over: Partial<ApiRequest>): ApiRequest => ({
  id: "1",
  number: "REQ-001",
  type: "installation",
  status: "date_agreed",
  client_name: "Иванов",
  client_phone: "+79001112233",
  client_address: "ул. Ленина, 15",
  source: "site",
  created_at: new Date(NOW - 10 * DAY).toISOString(),
  ...over,
});

describe("getOverdueRequests", () => {
  it("не считает заявкой в ожидании монтаж старше 5 дней", () => {
    const result = getOverdueRequests([req({ status: "pending" })], NOW);
    expect(result).toHaveLength(0);
  });

  it("не считает рекламацию в ожидании", () => {
    const result = getOverdueRequests([req({ type: "reclamation", status: "pending" })], NOW);
    expect(result).toHaveLength(0);
  });

  it("не считает отказ клиента и отменённую заявку", () => {
    const result = getOverdueRequests(
      [req({ status: "client_refused" }), req({ status: "cancelled" })],
      NOW
    );
    expect(result).toHaveLength(0);
  });

  it("считает монтаж с согласованной датой старше 5 дней", () => {
    const result = getOverdueRequests([req({ status: "date_agreed" })], NOW);
    expect(result).toHaveLength(1);
  });

  it("не считает закрытую заявку и замер", () => {
    const result = getOverdueRequests(
      [req({ status: "closed" }), req({ type: "measurement", status: "date_agreed" })],
      NOW
    );
    expect(result).toHaveLength(0);
  });

  it("не считает свежую заявку моложе 5 дней", () => {
    const result = getOverdueRequests(
      [req({ status: "date_agreed", created_at: new Date(NOW - 2 * DAY).toISOString() })],
      NOW
    );
    expect(result).toHaveLength(0);
  });
});
