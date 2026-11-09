using Microsoft.EntityFrameworkCore;
using TaskTrackerApi.Models;

namespace TaskTrackerApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>()
            .Property(task => task.Status)
            .HasConversion<string>();

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.Priority)
            .HasConversion<string>();

        base.OnModelCreating(modelBuilder);
    }
}
