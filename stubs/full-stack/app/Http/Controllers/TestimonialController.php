<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::active()
            ->ordered()
            ->get();

        return Inertia::render('Testimonials', [
            'testimonials' => $testimonials,
        ]);
    }
}
