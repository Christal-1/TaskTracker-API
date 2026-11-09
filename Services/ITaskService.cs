using TaskTrackerApi.DTOs;

namespace TaskTrackerApi.Services;

public interface ITaskService
{
    Task<IReadOnlyList<TaskResponseDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<TaskResponseDto?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<TaskResponseDto> CreateAsync(CreateTaskDto dto, CancellationToken cancellationToken);
    Task<TaskResponseDto?> UpdateAsync(int id, UpdateTaskDto dto, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken);
}
