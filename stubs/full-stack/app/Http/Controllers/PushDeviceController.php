<?php

namespace App\Http\Controllers;

use App\Models\UserPushDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushDeviceController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:512'],
            'platform' => ['nullable', 'string', 'max:50'],
            'app_name' => ['nullable', 'string', 'max:100'],
        ]);

        $device = UserPushDevice::query()->updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'token' => $validated['token'],
            ],
            [
                'platform' => $validated['platform'] ?? null,
                'app_name' => $validated['app_name'] ?? null,
                'active' => true,
                'last_seen_at' => now(),
            ],
        );

        return response()->json([
            'message' => 'Push device registered successfully.',
            'device' => $device,
        ]);
    }

    public function destroy(Request $request, UserPushDevice $device): JsonResponse
    {
        abort_unless($device->user_id === $request->user()->id, 403);

        $device->forceFill([
            'active' => false,
            'last_seen_at' => now(),
        ])->save();

        return response()->json([
            'message' => 'Push device deactivated successfully.',
        ]);
    }
}