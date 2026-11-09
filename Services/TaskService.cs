using Microsoft.EntityFrameworkCore;
using TaskTrackerApi.Data;
using TaskTrackerApi.DTOs;
using TaskTrackerApi.Models;

namespace TaskTrackerApi.Services;

public class TaskService(AppDbContext db) : ITaskService
{
    public async Task<IReadOnlyList<TaskResponseDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var tasks = await db.Tasks.AsNoTracking()
            .OrderBy(task => task.DueDate)
            .ThenByDescending(task => task.CreatedAt)
            .ToListAsync(cancellationToken);

        return tasks.Select(ToResponse).ToList();
    }

    public async Task<TaskResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.AsNoTracking()
            .FirstOrDefaultAsync(task => task.Id == id, cancellationToken);
        return task is null ? null : ToResponse(task);
    }

    public async Task<TaskResponseDto> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken)
    {
        var task = new TaskItem
        {
            Title = dto.Title.Trim(),
            Description = Clean(dto.Description),
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category.Trim(),
            Priority = dto.Priority,
            Status = dto.Status,
            DueDate = dto.DueDate?.Date,
            CreatedAt = DateTime.UtcNow
        };

        db.Tasks.Add(task);
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(task);
    }

    public async Task<TaskResponseDto?> UpdateAsync(int id, UpdateTaskDto dto, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(task => task.Id == id, cancellationToken);
        if (task is null) return null;

        task.Title = dto.Title.Trim();
        task.Description = Clean(dto.Description);
        task.Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category.Trim();
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.DueDate = dto.DueDate?.Date;
        task.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(task);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(task => task.Id == id, cancellationToken);
        if (task is null) return false;

        db.Tasks.Remove(task);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static TaskResponseDto ToResponse(TaskItem task) => new(
        task.Id, task.Title, task.Description, task.Category, task.Priority,
        task.Status, task.DueDate, task.CreatedAt, task.UpdatedAt);
}
