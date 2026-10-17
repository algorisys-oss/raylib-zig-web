const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const raylib_zig = b.dependency("raylib_zig", .{ .target = target, .optimize = optimize });

    const exe = b.addExecutable(.{
        .name = "basic_window",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{.{ .name = "raylib", .module = raylib_zig.module("raylib") }},
        }),
    });
    b.installArtifact(exe);

    const run = b.addRunArtifact(exe);
    b.step("run", "Run the example").dependOn(&run.step);
}
