FROM php:8.4-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    && docker-php-ext-install \
    pdo_pgsql \
    intl \
    zip \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Dossier de travail
WORKDIR /app

# Installer les dépendances PHP
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader \
    --no-scripts

# Copier le projet Symfony
COPY . .

# Préparer les dossiers Symfony
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var

# Lancer Symfony
CMD ["sh", "-c", "php bin/console cache:clear --env=prod && php -S 0.0.0.0:${PORT} -t public"]