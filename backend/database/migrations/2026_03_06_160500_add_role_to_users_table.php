<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('client')->after('password');
        });

        if (Schema::hasTable('roles') && Schema::hasTable('model_has_roles')) {
            $rolesByUser = DB::table('model_has_roles')
                ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
                ->where('model_has_roles.model_type', 'App\\Models\\User')
                ->pluck('roles.name', 'model_has_roles.model_id');

            foreach ($rolesByUser as $userId => $roleName) {
                DB::table('users')->where('id', $userId)->update(['role' => $roleName]);
            }
        }

        DB::table('users')
            ->where('email', 'admin@example.com')
            ->update(['role' => 'admin']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};