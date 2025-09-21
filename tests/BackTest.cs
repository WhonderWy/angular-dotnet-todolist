using System.Net;
using System.Net.Http.Json;
using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System;
using System.Diagnostics;
using System.Threading;

public class BackTest : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public BackTest(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();

        // If DEBUG_XUNIT=1 is set in the environment, wait for a debugger to attach.
        // This avoids relying on dotnet test launch quirks and lets you attach manually.
        if (Environment.GetEnvironmentVariable("DEBUG_XUNIT") == "1")
        {
            Console.WriteLine("[DEBUG] DEBUG_XUNIT=1; waiting for debugger to attach to process {0}...", Process.GetCurrentProcess().Id);
            while (!Debugger.IsAttached)
            {
                Thread.Sleep(100);
            }
            Console.WriteLine("[DEBUG] Debugger attached.");
        }
    }

    [Fact]
    public async Task CanCreateAndGetTodo()
    {
        var create = new { name = "Test task", isCompleted = false };
        var post = await _client.PostAsJsonAsync("/todos", create);
        post.EnsureSuccessStatusCode();

        var created = await post.Content.ReadFromJsonAsync<TodoItemDTO>();
        Assert.NotNull(created);
        Assert.Equal("Test task", created!.Name);

        var get = await _client.GetAsync($"/todos/{created.Id}");
        get.EnsureSuccessStatusCode();

        var fetched = await get.Content.ReadFromJsonAsync<TodoItemDTO>();
        Assert.Equal(created.Id, fetched!.Id);
    }

    [Fact]
    public async Task CanUpdateTodo()
    {
        var create = new { name = "Update me", isCompleted = false };
        var post = await _client.PostAsJsonAsync("/todos", create);
        var todo = await post.Content.ReadFromJsonAsync<TodoItemDTO>();

        var update = new { name = "Updated", isCompleted = true };
        var put = await _client.PutAsJsonAsync($"/todos/{todo!.Id}", update);
        Assert.Equal(HttpStatusCode.NoContent, put.StatusCode);

        var get = await _client.GetAsync($"/todos/{todo.Id}");
        var updated = await get.Content.ReadFromJsonAsync<TodoItemDTO>();
        Assert.Equal("Updated", updated!.Name);
        Assert.True(updated.IsComplete);
    }

    [Fact]
    public async Task CanDeleteTodo()
    {
        var create = new { name = "Delete me", isCompleted = false };
        var post = await _client.PostAsJsonAsync("/todos", create);
        var todo = await post.Content.ReadFromJsonAsync<TodoItemDTO>();

        var delete = await _client.DeleteAsync($"/todos/{todo!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var get = await _client.GetAsync($"/todos/{todo.Id}");
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }

    private record TodoItemDTO(int Id, string? Name, bool IsComplete);
}
