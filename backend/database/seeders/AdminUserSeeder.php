<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'mohdahma13@gmail.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('Simoox029@##'),
                'role' => 'admin',
            ]
        );
    }
}