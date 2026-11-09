using TaskTrackerApi.Models;

namespace TaskTrackerApi.DTOs;

public record TaskResponseDto(
    int Id,
    string Title,
    string? Description,
    string Category,
    TaskPriority Priority,
    TaskItemStatus Status,
    DateTime? DueDate,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
