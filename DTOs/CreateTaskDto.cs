using System.ComponentModel.DataAnnotations;
using TaskTrackerApi.Models;

namespace TaskTrackerApi.DTOs;

public class CreateTaskDto
{
    [Required, StringLength(120, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(40)]
    public string Category { get; set; } = "General";

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;
    public DateTime? DueDate { get; set; }
}
