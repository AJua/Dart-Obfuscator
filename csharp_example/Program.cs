using System;
using System.Collections.Generic;
using System.Linq;

namespace CSharpExample
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }

        public User(int id, string name, string email)
        {
            Id = id;
            Name = name;
            Email = email;
            CreatedAt = DateTime.Now;
        }

        public string GetDisplayName()
        {
            return $"{Name} ({Email})";
        }

        public void UpdateEmail(string newEmail)
        {
            if (!string.IsNullOrEmpty(newEmail))
            {
                Email = newEmail;
            }
        }

        public override string ToString()
        {
            return GetDisplayName();
        }

        public override bool Equals(object obj)
        {
            if (obj is User other)
            {
                return Id == other.Id;
            }
            return false;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }

    public interface IUserService
    {
        void AddUser(User user);
        User GetUserById(int id);
        List<User> GetAllUsers();
        bool RemoveUser(int id);
    }

    public class UserService : IUserService
    {
        private List<User> users = new List<User>();
        private int nextId = 1;

        public void AddUser(User user)
        {
            user.Id = nextId++;
            users.Add(user);
        }

        public User GetUserById(int id)
        {
            return users.FirstOrDefault(u => u.Id == id);
        }

        public List<User> GetAllUsers()
        {
            return users.ToList();
        }

        public bool RemoveUser(int id)
        {
            var user = GetUserById(id);
            if (user != null)
            {
                users.Remove(user);
                return true;
            }
            return false;
        }

        public void PrintUserStats()
        {
            Console.WriteLine($"Total users: {users.Count}");
            Console.WriteLine($"Next ID: {nextId}");
        }
    }

    public enum UserRole
    {
        Admin,
        Member,
        Guest
    }

    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }

        protected BaseEntity()
        {
            CreatedAt = DateTime.Now;
        }

        public abstract void PrintInfo();
    }

    public class ExtendedUser : BaseEntity
    {
        public string Username { get; set; }
        public UserRole Role { get; set; }

        public ExtendedUser(string username, UserRole role)
        {
            Username = username;
            Role = role;
        }

        public override void PrintInfo()
        {
            Console.WriteLine($"User: {Username}, Role: {Role}");
        }

        public bool IsAdmin()
        {
            return Role == UserRole.Admin;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            var userService = new UserService();

            // Create sample users
            var user1 = new User(0, "John Doe", "john@example.com");
            var user2 = new User(0, "Jane Smith", "jane@example.com");

            userService.AddUser(user1);
            userService.AddUser(user2);

            // Print user information
            userService.PrintUserStats();

            var allUsers = userService.GetAllUsers();
            foreach (var user in allUsers)
            {
                Console.WriteLine(user.ToString());
            }

            // Extended user example
            var extendedUser = new ExtendedUser("admin", UserRole.Admin);
            extendedUser.PrintInfo();
            Console.WriteLine($"Is admin: {extendedUser.IsAdmin()}");

            Console.WriteLine("C# Example completed!");
        }
    }
}