<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            $table->string('brand')->default('Perfume House Signature')->after('slug');
            $table->string('gender')->default('Unisex')->after('brand');
            $table->string('country_of_origin')->nullable()->after('image_url');
            $table->json('size_options')->nullable()->after('country_of_origin');
            $table->string('stock_status')->default('In stock')->after('size_options');
            $table->string('fragrance_family')->nullable()->after('stock_status');
            $table->text('recipe')->nullable()->after('fragrance_family');
            $table->json('top_notes')->nullable()->after('recipe');
            $table->json('heart_notes')->nullable()->after('top_notes');
            $table->json('base_notes')->nullable()->after('heart_notes');
            $table->string('longevity')->nullable()->after('base_notes');
            $table->string('sillage')->nullable()->after('longevity');
            $table->string('vibe')->nullable()->after('sillage');
            $table->string('when_to_wear')->nullable()->after('vibe');
            $table->string('feeling')->nullable()->after('when_to_wear');
            $table->decimal('average_rating', 3, 2)->default(4.50)->after('feeling');
            $table->unsignedInteger('reviews_count')->default(0)->after('average_rating');
            $table->json('reviews')->nullable()->after('reviews_count');
            $table->json('bottle_images')->nullable()->after('reviews');
            $table->json('packaging_images')->nullable()->after('bottle_images');
            $table->json('lifestyle_images')->nullable()->after('packaging_images');
            $table->json('ingredients')->nullable()->after('lifestyle_images');
            $table->text('delivery_info')->nullable()->after('ingredients');
            $table->text('return_policy')->nullable()->after('delivery_info');
            $table->text('authenticity_guarantee')->nullable()->after('return_policy');
            $table->boolean('is_best_seller')->default(false)->after('authenticity_guarantee');
            $table->boolean('is_trending')->default(false)->after('is_best_seller');
            $table->unsignedTinyInteger('discount_percentage')->default(0)->after('is_trending');
            $table->json('similar_slugs')->nullable()->after('discount_percentage');
        });
    }

    public function down(): void
    {
        Schema::table('perfumes', function (Blueprint $table) {
            $table->dropColumn([
                'brand',
                'gender',
                'country_of_origin',
                'size_options',
                'stock_status',
                'fragrance_family',
                'recipe',
                'top_notes',
                'heart_notes',
                'base_notes',
                'longevity',
                'sillage',
                'vibe',
                'when_to_wear',
                'feeling',
                'average_rating',
                'reviews_count',
                'reviews',
                'bottle_images',
                'packaging_images',
                'lifestyle_images',
                'ingredients',
                'delivery_info',
                'return_policy',
                'authenticity_guarantee',
                'is_best_seller',
                'is_trending',
                'discount_percentage',
                'similar_slugs',
            ]);
        });
    }
};
