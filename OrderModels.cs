using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace FoodDeliveryApp.Models
{
    /// <summary>
    /// Represents the main Order entity including the recent delivery location enhancements.
    /// Supports both camelCase and PascalCase variations from the API payload.
    /// </summary>
    public class Order
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("deliveryPrice")]
        public decimal DeliveryPrice { get; set; }

        /// <summary>
        /// Contains the stringified JSON string describing supplementary details (items, custom notes, customer name, and customer phone).
        /// See <see cref="OrderDescription"/> for the deserialized equivalent model.
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// The primary delivery location description/address.
        /// Resolved automatically either via user manual input or quick-filling a pre-registered hub location node.
        /// </summary>
        [JsonPropertyName("deliveryLocationDescription")]
        public string DeliveryLocationDescription { get; set; } = string.Empty;

        [JsonPropertyName("orderState")]
        public string OrderState { get; set; } = "preparing";

        [JsonPropertyName("receptionDescription")]
        public string ReceptionDescription { get; set; } = string.Empty;

        [JsonPropertyName("deliveryName")]
        public string DeliveryName { get; set; } = string.Empty;

        [JsonPropertyName("deliveryUserId")]
        public int? DeliveryUserId { get; set; }

        [JsonPropertyName("deliveryTime")]
        public string? DeliveryTime { get; set; }

        [JsonPropertyName("createdAt")]
        public string? CreatedAt { get; set; }

        [JsonPropertyName("updatedAt")]
        public string? UpdatedAt { get; set; }

        /// <summary>
        /// Assistant method to easily parse and deserialize the embedded JSON string inside the <see cref="Description"/> field.
        /// </summary>
        public OrderDescription? GetParsedDescription()
        {
            if (string.IsNullOrWhiteSpace(Description)) return null;
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<OrderDescription>(Description);
            }
            catch
            {
                // Fallback for standard plain-text legacy descriptions
                return new OrderDescription { Text = Description };
            }
        }

        /// <summary>
        /// Directly accesses the list of individual food items inside this order.
        /// Automatically parses the stringified JSON stored in the <see cref="Description"/> field.
        /// </summary>
        [JsonIgnore]
        public List<CartItemSummary> ItemsList => GetParsedDescription()?.Items ?? new List<CartItemSummary>();

        /// <summary>
        /// Helper to retrieve the customer name directly from the parsed metadata description.
        /// </summary>
        [JsonIgnore]
        public string CustomerName => GetParsedDescription()?.CustomerName ?? string.Empty;

        /// <summary>
        /// Helper to retrieve the customer phone number directly from the parsed metadata description.
        /// </summary>
        [JsonIgnore]
        public string CustomerPhone => GetParsedDescription()?.CustomerPhone ?? string.Empty;

        /// <summary>
        /// Helper to calculate the order's subtotal price by summing all (Price * Quantity) from the items list.
        /// </summary>
        [JsonIgnore]
        public decimal SubtotalPrice
        {
            get
            {
                decimal sum = 0;
                foreach (var item in ItemsList)
                {
                    sum += item.Price * item.Quantity;
                }
                return sum;
            }
        }

        /// <summary>
        /// Calculates the overall total price (Subtotal + Delivery Price).
        /// </summary>
        [JsonIgnore]
        public decimal TotalPrice => SubtotalPrice + DeliveryPrice;
    }

    /// <summary>
    /// Model mapping the structure stored as stringified JSON inside the Order.Description field.
    /// </summary>
    public class OrderDescription
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("items")]
        public List<CartItemSummary> Items { get; set; } = new();

        [JsonPropertyName("invoiceImages")]
        public List<string> InvoiceImages { get; set; } = new();

        [JsonPropertyName("customerName")]
        public string CustomerName { get; set; } = string.Empty;

        [JsonPropertyName("customerPhone")]
        public string CustomerPhone { get; set; } = string.Empty;
    }

    /// <summary>
    /// Simplified item node stored within the serialized order description items array.
    /// </summary>
    public class CartItemSummary
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("price")]
        public decimal Price { get; set; }

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; }

        [JsonPropertyName("category")]
        public string Category { get; set; } = string.Empty;
    }

    /// <summary>
    /// Delivery location node model matching the structural directory configurations.
    /// </summary>
    public class LocationNode
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;

        [JsonPropertyName("googleMapsUrl")]
        public string GoogleMapsUrl { get; set; } = string.Empty;

        [JsonPropertyName("image")]
        public string Image { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO model for submitting new order requests to the API.
    /// </summary>
    public class CreateOrderRequestDto
    {
        [JsonPropertyName("deliveryPrice")]
        public decimal DeliveryPrice { get; set; }

        /// <summary>
        /// Serialized JSON containing nested metadata (items, notes, client name, client phone).
        /// </summary>
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        /// <summary>
        /// Target delivery location description.
        /// </summary>
        [JsonPropertyName("deliveryLocationDescription")]
        public string DeliveryLocationDescription { get; set; } = string.Empty;

        [JsonPropertyName("orderState")]
        public string OrderState { get; set; } = "preparing";

        [JsonPropertyName("receptionDescription")]
        public string ReceptionDescription { get; set; } = string.Empty;

        [JsonPropertyName("deliveryUserId")]
        public int DeliveryUserId { get; set; }

        [JsonPropertyName("deliveryTime")]
        public string DeliveryTime { get; set; } = string.Empty;
    }
}
