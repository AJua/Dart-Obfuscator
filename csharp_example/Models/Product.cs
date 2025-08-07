using System;
using System.ComponentModel.DataAnnotations;

namespace CSharpExample.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        
        [Required]
        public string ProductName { get; set; }
        
        public decimal Price { get; set; }
        public string Description { get; set; }
        public Category ProductCategory { get; set; }
        public bool IsActive { get; set; }

        public Product()
        {
            IsActive = true;
        }

        public Product(string name, decimal price, Category category) : this()
        {
            ProductName = name;
            Price = price;
            ProductCategory = category;
        }

        public decimal CalculateDiscountedPrice(decimal discountPercentage)
        {
            return Price * (1 - discountPercentage / 100);
        }

        public void ApplyDiscount(decimal percentage)
        {
            Price = CalculateDiscountedPrice(percentage);
        }

        public string GetFormattedPrice()
        {
            return $"${Price:F2}";
        }

        public bool IsExpensive()
        {
            return Price > 100;
        }
    }

    public enum Category
    {
        Electronics,
        Clothing,
        Books,
        Home,
        Sports
    }
}