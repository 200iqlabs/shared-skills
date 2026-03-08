"""Unit tests for CFO business logic functions.

These tests do NOT require API credentials — they use fixture data
and test the calculation/summarization logic directly.
"""

import sys
import os
from datetime import datetime

# Add agents/cfo/scripts to path so we can import the modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "agents", "cfo", "scripts"))

from get_mrr import calculate_mrr
from get_costs import summarize_costs
from get_invoices import summarize_invoices
from get_revenue import summarize_revenue


# ── calculate_mrr() ──


class TestCalculateMrr:

    def _make_subscription(self, amount_cents, currency, interval, interval_count=1, quantity=1):
        """Helper to create a minimal Stripe subscription fixture."""
        return {
            "id": f"sub_{currency}_{interval}",
            "customer": "cus_test",
            "items": {
                "data": [{
                    "price": {
                        "id": f"price_{interval}",
                        "unit_amount": amount_cents,
                        "currency": currency.lower(),
                        "recurring": {
                            "interval": interval,
                            "interval_count": interval_count,
                        },
                    },
                    "quantity": quantity,
                }],
            },
        }

    def test_monthly_passthrough(self):
        """Monthly subscription amount passes through as-is."""
        subs = [self._make_subscription(10000, "usd", "month")]  # $100/month
        result = calculate_mrr(subs)
        assert "USD" in result
        assert result["USD"]["mrr"] == 100.0

    def test_yearly_divided_by_12(self):
        """Yearly subscription is divided by 12."""
        subs = [self._make_subscription(120000, "usd", "year")]  # $1200/year
        result = calculate_mrr(subs)
        assert abs(result["USD"]["mrr"] - 100.0) < 0.01

    def test_weekly_multiplied(self):
        """Weekly subscription is multiplied by 52/12."""
        subs = [self._make_subscription(1000, "usd", "week")]  # $10/week
        result = calculate_mrr(subs)
        expected = 10.0 * (52 / 12)
        assert abs(result["USD"]["mrr"] - expected) < 0.01

    def test_daily_multiplied(self):
        """Daily subscription is multiplied by 30."""
        subs = [self._make_subscription(100, "usd", "day")]  # $1/day
        result = calculate_mrr(subs)
        assert abs(result["USD"]["mrr"] - 30.0) < 0.01

    def test_currency_grouping(self):
        """Subscriptions in different currencies are grouped separately."""
        subs = [
            self._make_subscription(10000, "pln", "month"),  # 100 PLN/month
            self._make_subscription(5000, "eur", "month"),   # 50 EUR/month
            self._make_subscription(20000, "pln", "month"),  # 200 PLN/month
        ]
        result = calculate_mrr(subs)
        assert "PLN" in result
        assert "EUR" in result
        assert result["PLN"]["mrr"] == 300.0
        assert result["EUR"]["mrr"] == 50.0

    def test_currency_filter(self):
        """currency_filter limits results to one currency."""
        subs = [
            self._make_subscription(10000, "pln", "month"),
            self._make_subscription(5000, "eur", "month"),
        ]
        result = calculate_mrr(subs, currency_filter="PLN")
        assert "PLN" in result
        assert "EUR" not in result

    def test_interval_count(self):
        """Interval count > 1 divides the amount correctly (e.g., every 3 months)."""
        subs = [self._make_subscription(30000, "usd", "month", interval_count=3)]  # $300 every 3 months
        result = calculate_mrr(subs)
        assert abs(result["USD"]["mrr"] - 100.0) < 0.01

    def test_quantity(self):
        """Quantity multiplier works correctly."""
        subs = [self._make_subscription(1000, "usd", "month", quantity=5)]  # $10/month × 5
        result = calculate_mrr(subs)
        assert result["USD"]["mrr"] == 50.0

    def test_empty_subscriptions(self):
        """Empty list returns empty result."""
        result = calculate_mrr([])
        assert result == {}


# ── summarize_costs() ──


class TestSummarizeCosts:

    SAMPLE_COSTS = [
        {"net_price": 10000, "gross_price": 12300, "category": "Office", "invoice_date": "2026-01-15"},
        {"net_price": 20000, "gross_price": 24600, "category": "Office", "invoice_date": "2026-01-20"},
        {"net_price": 5000, "gross_price": 6150, "category": "Software", "invoice_date": "2026-02-10"},
    ]

    def test_basic_summary(self):
        """Summarize without grouping calculates correct totals."""
        result = summarize_costs(self.SAMPLE_COSTS)
        assert result["count"] == 3
        assert result["total_net"] == 350.0   # (100 + 200 + 50)
        assert result["total_gross"] == 430.5  # (123 + 246 + 61.50)

    def test_group_by_category(self):
        """Group by category creates per-category breakdown."""
        result = summarize_costs(self.SAMPLE_COSTS, group_by="category")
        assert "by_category" in result
        cats = result["by_category"]
        assert "Office" in cats
        assert "Software" in cats
        assert cats["Office"]["count"] == 2
        assert cats["Office"]["net"] == 300.0
        assert cats["Software"]["count"] == 1
        assert cats["Software"]["net"] == 50.0

    def test_group_by_month(self):
        """Group by month creates per-month breakdown sorted chronologically."""
        result = summarize_costs(self.SAMPLE_COSTS, group_by="month")
        assert "by_month" in result
        months = result["by_month"]
        assert "2026-01" in months
        assert "2026-02" in months
        assert months["2026-01"]["count"] == 2
        assert months["2026-02"]["count"] == 1
        # Verify chronological sort
        month_keys = list(months.keys())
        assert month_keys == sorted(month_keys)

    def test_empty_costs(self):
        """Empty list returns zeroes."""
        result = summarize_costs([])
        assert result["count"] == 0
        assert result["total_net"] == 0
        assert result["total_gross"] == 0


# ── summarize_invoices() ──


class TestSummarizeInvoices:

    def test_totals_calculation(self):
        """Net and gross totals are calculated correctly."""
        invoices = [
            {"net_price": 10000, "gross_price": 12300},   # 100 net, 123 gross
            {"net_price": 50000, "gross_price": 61500},   # 500 net, 615 gross
            {"net_price": 25000, "gross_price": 30750},   # 250 net, 307.50 gross
        ]
        result = summarize_invoices(invoices)
        assert result["count"] == 3
        assert result["total_net"] == 850.0
        assert result["total_gross"] == 1045.5

    def test_empty_invoices(self):
        """Empty list returns zeroes."""
        result = summarize_invoices([])
        assert result["count"] == 0
        assert result["total_net"] == 0
        assert result["total_gross"] == 0

    def test_missing_fields_default_zero(self):
        """Missing price fields default to 0."""
        invoices = [{"other_field": "value"}]
        result = summarize_invoices(invoices)
        assert result["count"] == 1
        assert result["total_net"] == 0
        assert result["total_gross"] == 0


# ── summarize_revenue() ──


class TestSummarizeRevenue:

    def test_currency_grouping(self):
        """Revenue is grouped by currency."""
        invoices = [
            {"amount_paid": 10000, "currency": "usd", "created": 1706745600,
             "status_transitions": {"paid_at": 1706745600}},  # 2024-02-01
            {"amount_paid": 20000, "currency": "eur", "created": 1706745600,
             "status_transitions": {"paid_at": 1706745600}},
        ]
        result = summarize_revenue(invoices)
        assert "USD" in result
        assert "EUR" in result
        assert result["USD"]["total_revenue"] == 100.0
        assert result["EUR"]["total_revenue"] == 200.0

    def test_month_grouping(self):
        """Revenue is grouped by month within each currency."""
        jan_ts = int(datetime(2026, 1, 15).timestamp())
        feb_ts = int(datetime(2026, 2, 15).timestamp())
        invoices = [
            {"amount_paid": 10000, "currency": "usd", "created": jan_ts,
             "status_transitions": {"paid_at": jan_ts}},
            {"amount_paid": 20000, "currency": "usd", "created": feb_ts,
             "status_transitions": {"paid_at": feb_ts}},
        ]
        result = summarize_revenue(invoices)
        by_month = result["USD"]["by_month"]
        assert "2026-01" in by_month
        assert "2026-02" in by_month
        assert by_month["2026-01"] == 100.0
        assert by_month["2026-02"] == 200.0

    def test_paid_at_fallback_to_created(self):
        """When paid_at is None, falls back to created timestamp."""
        ts = int(datetime(2026, 3, 1).timestamp())
        invoices = [
            {"amount_paid": 5000, "currency": "usd", "created": ts,
             "status_transitions": {"paid_at": None}},
        ]
        result = summarize_revenue(invoices)
        assert result["USD"]["invoice_count"] == 1
        assert "2026-03" in result["USD"]["by_month"]

    def test_invoice_count(self):
        """Invoice count is tracked per currency."""
        ts = int(datetime(2026, 1, 1).timestamp())
        invoices = [
            {"amount_paid": 100, "currency": "usd", "created": ts,
             "status_transitions": {"paid_at": ts}},
            {"amount_paid": 200, "currency": "usd", "created": ts,
             "status_transitions": {"paid_at": ts}},
        ]
        result = summarize_revenue(invoices)
        assert result["USD"]["invoice_count"] == 2

    def test_empty_invoices(self):
        """Empty list returns empty result."""
        result = summarize_revenue([])
        assert result == {}
